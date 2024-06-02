import type { ShipData } from "@/interfaces/ShipData.ts";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import { getAroundCells, getShipCells } from "@/helpers";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";
import CellsMatrixService from "@/services/CellsMatrixService.ts";

/**
 * Сервис, отвечающий за проверку возможности размещения кораблей в клетках.
 */
export default class ShipPlaceValidationService extends CellsMatrixService {

  constructor(cells: CellsMatrix) {
    super(cells)
  }

  /**
   * Проверка клетки, на возможность установки корабля.
   * @param shipData Данные корабля
   * @param cellData Данные клетки, которая будет начальной клеткой корабля
   */
  public checkCellForPlacement(shipData: ShipData, cellData: ColRowData): boolean {
    const shipCells: Array<ColRowData> = getShipCells(cellData, shipData);
    for (const cell of shipCells) {
      if (!this.checkCells(cell)) return false;
    }
    return true;
  }

  /**
   * Проверка клеток вокруг, на возможность размещения корабля в данную клетку.
   * @return true В данную клетку можно установить корабль
   * @return false В данную клетку нельзя установить корабль
   */
  private checkCells(cellData: ColRowData): boolean {
    //Проверка, что данная клетка валидна и не занята
    if (this.getShipIdFromCell(cellData) !== null) return false;
    //Если окружающая клетка не пустая, возвращаем false
    for (const cell of getAroundCells(cellData)) {
      if (this.getShipIdFromCell(cell) !== null) return false;
    }
    return true;
  }
}