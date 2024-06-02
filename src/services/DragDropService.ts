import { Ref } from "vue";
import { ShipData } from "@/interfaces/ShipData.ts";
import { Coordinates } from "@/interfaces/Coordinates.ts";
import FindCellService from "@/services/FindCellService.ts";
import ShipsCounterService from "@/services/ShipsCounterService.ts";
import Ship from "@/models/Ship.ts";
import ShipPlacementService from "@/services/ShipPlacementService.ts";
import RandomCellsService from "@/services/RandomCellsService.ts";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";

/**
 * Сервис, отвечающий за размещение кораблей по полю.
 */
export default class DragDropService {
  //Флаг, для проверки, было нажатие или перетаскивание
  private clickFlag: boolean = false;
  //Координаты объекта корабля при клике на него
  private shipInitialCoordinates: Coordinates = { X: 0, Y: 0 };

  constructor(
    //Сервисы
    private readonly shipPlacementService: ShipPlacementService,
    private readonly findCellPlacementService: FindCellService,
    private shipsCounter: ShipsCounterService,
    //Массив кораблей пользователя
    private ships: Array<ShipData>,
    //Отклонение объекта влево и вверх, для перемещения по странице
    private dragLeft: Ref<number>,
    private dragTop: Ref<number>,
    //id корабля, который перемещается
    private draggableShipId: Ref<number>,
    //Массив хранящий id кораблей, размещенных на поле
    private readonly placedShips: Ref<Array<number>>
  ) {
  }

  /**
   * Обработка начала перемещения корабля.
   */
  public dragStartEvent(event: MouseEvent | TouchEvent, shipData: ShipData): void {

    const shipElem: HTMLDivElement = event.target as HTMLDivElement;
    if (!shipElem.classList.contains('dragging')) this.clickFlag = true;
    if (this.draggableShipId.value === shipData.id) {
      return
    }
    this.draggableShipId.value = shipData.id;
    shipElem.classList.add('dragging');
    //Если корабль не размещен на поле, уменьшаем счетчик оставшихся кораблей
    if (!this.shipIsPlaced()) {
      this.shipsCounter.decrementRemaining(shipData.size);
    }
    //Записываем начальные координаты корабля
    this.shipInitialCoordinates.X = this.getPageX(event);
    this.shipInitialCoordinates.Y = this.getPageY(event);

  }

  /**
   * Обработка процесса перемещения корабля.
   */
  public movingEvent(event: MouseEvent | TouchEvent): void {
    if (this.draggableShipId.value < 0) {
      return;
    }
    this.clickFlag = false;
    //Записываем новые координаты на странице для корабля
    this.dragLeft.value = this.getPageX(event) - this.shipInitialCoordinates.X;
    this.dragTop.value = this.getPageY(event) - this.shipInitialCoordinates.Y;
    //Получаем данные перемещаемого корабля
    const ship = this.getShipById(this.draggableShipId.value);
    if (!ship || !ship.isDragging()) return;

    //Производим проверку возможности размещения корабля в текущих координатах и отображаем результат
    this.shipPlacementService.removeAllowedCells(ship);
    const newCell = ship.getNewColRowData(this.findCellPlacementService, event);
    if (newCell) {
      const oldCell = ship.getCurrentColRowData();
      if (oldCell) {
        this.shipPlacementService.removeShipFromCell(oldCell, ship);
        this.shipPlacementService.checkShipPlacing(newCell, ship);
        this.shipPlacementService.placeShipToCell(oldCell, ship);
      } else {
        this.shipPlacementService.checkShipPlacing(newCell, ship);
      }

    } else {
      ship.setClassForbidden();
    }

  }

  /**
   * Обработка процесса завершения перемещения корабля.
   */
  public dragStopEvent(event: MouseEvent | TouchEvent): void {
    if (this.draggableShipId.value < 0) return;

    const ship = this.getShipById(this.draggableShipId.value);
    if (!ship || !ship.isDragging()) return;

    this.shipPlacementService.removeAllowedCells(ship);
    ship.removeDragging();
    //Если пользователь нажимал на корабль, а не перемещал его
    if (this.clickFlag) {
      if (this.shipIsPlaced()) this.shipClick(ship)
      else this.shipsCounter.incrementRemaining(ship.shipData.size);
    }
    //Если пользователь перемещал корабль
    else {
      const newCell = ship.getNewColRowData(this.findCellPlacementService, event);
      //Если в координатах есть клетка
      if (newCell) {
        const oldCell = ship.getCurrentColRowData();
        //Если есть старая клетка, то удаляем корабль из нее
        if (oldCell) this.shipPlacementService.removeShipFromCell(oldCell, ship);
        //Размещаем корабль в новой клетке
        const isPlace = this.shipPlacementService.placeShipToCell(newCell, ship);
        //Если разместить не удалось и у корабля есть старая клетка, размещаем его в старой клетке
        if (!isPlace && oldCell) this.shipPlacementService.placeShipToCell(oldCell, ship);
        //Если корабль не был ранее размещен на поле
        if (!this.shipIsPlaced()) {
          //Если корабль был размещен
          if (isPlace) {
            this.placedShips.value.push(this.draggableShipId.value)
            this.shipsCounter.incrementPlaced();
          }
          //Если корабль не удалось разместить, увеличиваем счетчик оставшихся кораблей
          else this.shipsCounter.incrementRemaining(ship.shipData.size);
        }

      }
      //Если в координатах не нашлась клетка
      else if (!this.shipIsPlaced()) this.shipsCounter.incrementRemaining(ship.shipData.size);
    }

    this.clearValues();
  }

  /*
   * Обнуление и остановка перемещения при изменении размера экрана.
   */
  public resizeEvent(): void {
    if (this.draggableShipId.value === -1) return;
    const ship = this.getShipById(this.draggableShipId.value)
    if (!ship || !ship.isDragging()) return;

    this.shipPlacementService.removeAllowedCells(ship);
    ship.removeDragging()
    if (!this.shipIsPlaced()) this.shipsCounter.incrementRemaining(ship.shipData.size);

    this.clearValues();
  }

  /*
   * Случайная расстановка кораблей по полю.
   */
  public randomPlace(): void {
    const battlefieldData: BattlefieldData | null = new RandomCellsService().getRandomBattlefieldData(this.ships);
    if (!battlefieldData) return;
    this.ships = battlefieldData.ships;
    this.shipPlacementService.placeShipsFromCells(battlefieldData);
    this.fullPlacedShips();
    this.shipsCounter.setAllPlaced();
  }

  /**
   * Обработка поворота корабля при нажатии на него
   */
  private shipClick(ship: Ship): void {
    if (ship.shipData.size === 1) {
      ship.changePosition();
      return;
    }

    this.shipPlacementService.removeAllowedCells(ship);
    //Меняем позицию корабля
    const oldCell = ship.getCurrentColRowData();
    if (oldCell) {
      this.shipPlacementService.removeShipFromCell(oldCell, ship);
      ship.changePosition();
      //Размещаем корабль в той же клетке, но с измененной позицией
      const isPlace = this.shipPlacementService.placeShipToCell(oldCell, ship);
      //Если разместить не удалось, возвращаем кораблю предыдущую позицию
      if (!isPlace) {
        ship.changePosition();
        this.shipPlacementService.placeShipToCell(oldCell, ship);
        ship.setAnimateTurnForbidden();
      }
    }

  }

  /**
   * Получить корабль по id.
   */
  private getShipById(shipId: number): Ship | null {
    return Ship.create(
      this.ships.find(ship => ship.id === shipId) as ShipData
    );
  }

  /**
   * Проверка, что корабль размещен на поле.
   */
  private shipIsPlaced(): boolean {
    if (this.draggableShipId.value < 0) return false;
    return this.placedShips.value.includes(this.draggableShipId.value);
  }

  /**
   * Очистка глобальных значений.
   */
  private clearValues(): void {
    // сбрасываем все значения к начальным
    this.draggableShipId.value = -1;
    this.dragLeft.value = 0;
    this.dragTop.value = 0;
  }

  /**
   * Получить координаты по X из Event.
   */
  private getPageX(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.pageX;
    } else {
      return event.changedTouches[0].pageX;
    }
  }

  /*
   * Получить координаты по Y из Event.
   */
  private getPageY(event: MouseEvent | TouchEvent): number {
    if (event instanceof MouseEvent) {
      return event.pageY;
    } else {
      return event.changedTouches[0].pageY;
    }
  }

  /*
   * Добавление всех кораблей в массив размещенных кораблей.
   */
  private fullPlacedShips(): void {
    this.clearPlacedShipsArray();
    for (let shipId of this.ships) {
      this.placedShips.value.push(shipId.id);
    }
  }

  /*
   * Очищение массива размещенных кораблей.
   */
  private clearPlacedShipsArray(): void {
    this.placedShips.value.splice(0, this.placedShips.value.length);
  }
}