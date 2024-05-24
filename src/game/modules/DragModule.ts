import {Ref} from "vue";
import {ShipData} from "../interfaces/ShipData";
import {Coordinates} from "../interfaces/Coordinates";
import FindCellModule from "./FindCellModule.ts";
import ShipsCounter from "../classes/ShipsCounter";
import Ship from "../classes/Ship";
import ShipPlacementModule from "./ShipPlacementModule";
import RandomCellsModule from "./RandomCellsModule";
import {BattlefieldData} from "../interfaces/BattlefieldData";

/*
    Модуль, отвечающий за размещение кораблей по полю.
 */
export default class DragModule {
    //Флаг, для проверки, было нажатие или перетаскивание
    private clickFlag: boolean;
    //id корабля, который перемещается
    private draggableShipId: Ref<number>;
    //Массив хранящий id кораблей, размещенных на поле
    private readonly placedShips: Ref<Array<number>>;
    //Координаты объекта корабля при клике на него
    private shipInitialCoordinates: Coordinates;
    //Отклонение объекта влево и вверх, для перемещения по странице
    private dragLeft: Ref<number>;
    private dragTop: Ref<number>
    //Массив кораблей пользователя
    private ships: Array<ShipData>;
    //Модули
    private readonly shipPlacementModule: ShipPlacementModule
    private readonly findCellPlacementModule: FindCellModule;
    private shipsCounter: ShipsCounter;

    constructor(shipPlacementModule: ShipPlacementModule,
                findCellPlacementModule: FindCellModule,
                shipsCounter: ShipsCounter, ships: Array<ShipData>,
                dragLeft: Ref<number>, dragTop: Ref<number>,
                draggableShipId: Ref<number>, placedShips: Ref<Array<number>>) {
        this.clickFlag = false;
        this.draggableShipId = draggableShipId;
        this.placedShips = placedShips;
        this.shipInitialCoordinates = {X: 0, Y: 0,}
        this.shipPlacementModule = shipPlacementModule;
        this.findCellPlacementModule = findCellPlacementModule;
        this.shipsCounter = shipsCounter;
        this.ships = ships;
        this.dragLeft = dragLeft;
        this.dragTop = dragTop;
    }

    /*
        Обработка начала перемещения корабля.
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

    /*
        Обработка процесса перемещения корабля.
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
        this.shipPlacementModule.removeAllowedCells(ship);
        const newCell = ship.getNewColRowData(this.findCellPlacementModule, event);
        if (newCell) {
            const oldCell = ship.getCurrentColRowData();
            if (oldCell) {
                this.shipPlacementModule.removeShipFromCell(oldCell, ship);
                this.shipPlacementModule.checkShipPlacing(newCell, ship);
                this.shipPlacementModule.placeShipToCell(oldCell, ship);
            } else {
                this.shipPlacementModule.checkShipPlacing(newCell, ship);
            }

        } else {
            ship.setClassForbidden();
        }

    }

    /*
        Обработка процесса завершения перемещения корабля.
     */
    public dragStopEvent(event: MouseEvent | TouchEvent): void {
        if (this.draggableShipId.value < 0) return;

        const ship = this.getShipById(this.draggableShipId.value);
        if (!ship || !ship.isDragging()) return;

        this.shipPlacementModule.removeAllowedCells(ship);
        ship.removeDragging();
        //Если пользователь нажимал на корабль, а не перемещал его
        if (this.clickFlag) {
            if (this.shipIsPlaced()) this.shipClick(ship)
            else this.shipsCounter.incrementRemaining(ship.shipData.size);
        }
        //Если пользователь перемещал корабль
        else {
            const newCell = ship.getNewColRowData(this.findCellPlacementModule, event);
            //Если в координатах есть клетка
            if (newCell) {
                const oldCell = ship.getCurrentColRowData();
                //Если есть старая клетка, то удаляем корабль из нее
                if (oldCell) this.shipPlacementModule.removeShipFromCell(oldCell, ship);
                //Размещаем корабль в новой клетке
                const isPlace = this.shipPlacementModule.placeShipToCell(newCell, ship);
                //Если разместить не удалось и у корабля есть старая клетка, размещаем его в старой клетке
                if (!isPlace && oldCell) this.shipPlacementModule.placeShipToCell(oldCell, ship);
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
        Обработка поворота корабля при нажатии на него
     */
    private shipClick(ship: Ship): void {
        if (ship.shipData.size === 1) {
            ship.changePosition();
            return;
        }

        this.shipPlacementModule.removeAllowedCells(ship);
        //Меняем позицию корабля
        const oldCell = ship.getCurrentColRowData();
        if (oldCell) {
            this.shipPlacementModule.removeShipFromCell(oldCell, ship);
            ship.changePosition();
            //Размещаем корабль в той же клетке, но с измененной позицией
            const isPlace = this.shipPlacementModule.placeShipToCell(oldCell, ship);
            //Если разместить не удалось, возвращаем кораблю предыдущую позицию
            if (!isPlace) {
                ship.changePosition();
                this.shipPlacementModule.placeShipToCell(oldCell, ship);
                ship.setAnimateTurnForbidden();
            }
        }

    }
    /*
        Получить корабль по id.
     */
    private getShipById(shipId: number): Ship | null {
        return Ship.create(
            this.ships.find(ship => ship.id === shipId) as ShipData
        );
    }

    /*
        Проверка, что корабль размещен на поле.
     */
    private shipIsPlaced(): boolean {
        if (this.draggableShipId.value < 0) return false;
        return this.placedShips.value.indexOf(this.draggableShipId.value) !== -1;
    }

    /*
        Очистка глобальных значений.
     */
    private clearValues(): void {
        // сбрасываем все значения к начальным
        this.draggableShipId.value = -1;
        this.dragLeft.value = 0;
        this.dragTop.value = 0;
    }

    /*
        Получить координаты по X из Event.
     */
    private getPageX(event: MouseEvent | TouchEvent): number {
        if (event instanceof MouseEvent) {
            return event.pageX;
        } else {
            return event.changedTouches[0].pageX;
        }
    }

    /*
        Получить координаты по Y из Event.
     */
    private getPageY(event: MouseEvent | TouchEvent): number {
        if (event instanceof MouseEvent) {
            return event.pageY;
        } else {
            return event.changedTouches[0].pageY;
        }
    }


    /*
        Обнуление и остановка перемещения при изменении размера экрана.
     */
    public resizeEvent(): void {
        if (this.draggableShipId.value === -1) return;
        const ship = this.getShipById(this.draggableShipId.value)
        if (!ship || !ship.isDragging()) return;

        this.shipPlacementModule.removeAllowedCells(ship);
        ship.removeDragging()
        if (!this.shipIsPlaced()) this.shipsCounter.incrementRemaining(ship.shipData.size);

        this.clearValues();
    }

    /*
        Добавление всех кораблей в массив размещенных кораблей.
     */
    private fullPlacedShips(): void {
        this.clearPlacedShipsArray();
        for (let shipId of this.ships) {
            this.placedShips.value.push(shipId.id);
        }
    }

    /*
        Очищение массива размещенных кораблей.
     */
    private clearPlacedShipsArray(): void {
        this.placedShips.value.splice(0, this.placedShips.value.length);
    }


    /*
        Случайная расстановка кораблей по полю.
     */
    public randomPlace(): void {
        const battlefieldData: BattlefieldData | null = new RandomCellsModule().getRandomBattlefieldData(this.ships);
        if (!battlefieldData) return;
        this.ships = battlefieldData.ships;
        this.shipPlacementModule.placeShipsFromCells(battlefieldData.cells, this.ships);
        this.fullPlacedShips();
        this.shipsCounter.setAllPlaced();
    }
}