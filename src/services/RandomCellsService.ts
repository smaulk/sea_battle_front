import { ShipData } from "@/interfaces/ShipData.ts";
import { getNewCellData, getRandomColRowData } from "@/helpers";
import { Position } from "@/enums/Position.ts";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import ShipPlaceValidationService from "@/services/ShipPlaceValidationService.ts";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";
import CellsMatrixService from "@/services/CellsMatrixService.ts";

/**
 * Сервис, отвечающий за случайную расстановку кораблей на поле.
 */
export default class RandomCellsService extends CellsMatrixService {

  private _ships: Array<ShipData> = [];
  private validationService: ShipPlaceValidationService;

  constructor() {
    super();
    this.validationService = new ShipPlaceValidationService(this.cells);
  }

  /**
   * Получить случайные данные поля (матрица клеток и массив кораблей)
   * @param ships Массив кораблей, которые будут расставлены случайным образом
   */
  public getRandomBattlefieldData(ships: Array<ShipData>): BattlefieldData | null {
    this._ships = ships;
    //Делаем 1000 попыток, пока не получится расставить все корабли
    for (let attempt = 0; attempt < 1000; attempt++) {
      if (this.placeAllShips()) {
        return {
          cells: this.cells,
          ships: this._ships
        };
      }
      this.clearCells();
    }
    return null;
  }

  /**
   * Расставить на поле все корабли.
   * @return boolean true если удалось расставить все корабли, и false если не удалось
   */
  private placeAllShips(): boolean {
    for (let i = 0; i < this._ships.length; i++) {
      if (!this.placeShip(i)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Поставить корабль на поле.
   * @param i Элемент массива _ships
   * @return  true если удалось поставить корабль
   * @return false если не удалось поставить корабль
   */
  private placeShip(i: number): boolean {
    //Делаем 50 попыток расставить корабль на поле
    for (let attempt = 0; attempt < 50; attempt++) {
      const { cellData, position } = this.getRandomPosition();
      this._ships[i] = { ...this._ships[i], position };
      if (this.validationService.checkCellForPlacement(this._ships[i], cellData)) {
        this.setShipToMatrix(this._ships[i], cellData);
        return true;
      }
    }
    return false;
  }

  /**
   * Получить случайную клетку и позицию корабля
   */
  private getRandomPosition(): { cellData: ColRowData, position: Position } {
    const cellData: ColRowData = getRandomColRowData();
    const position = Math.random() > 0.5 ? Position.Horizontal : Position.Vertical;

    return { cellData, position };
  }

  /**
   * Записать корабль в матрицу клеток.
   */
  private setShipToMatrix(ship: ShipData, startCellData: ColRowData): void {
    for (let i = 0; i < ship.size; i++) {
      const cellData = getNewCellData(startCellData, ship.position, i);
      this.setShipIdInCell(cellData, ship.id);
    }
  }
}