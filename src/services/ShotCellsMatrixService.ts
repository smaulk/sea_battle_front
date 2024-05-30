import { BoolCellsMatrix } from "@/interfaces/CellsMatrix.ts";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import { getFilledCellsMatrix, isValidColRowData } from "@/helpers";

/**
 * Сервис, отвечающий за работу с матрицей клеток, показывающей наличие выстрела в клетку.
 */
export default class ShotCellsMatrixService {
  private readonly _shotCells: BoolCellsMatrix = [];

  constructor(cells?: BoolCellsMatrix) {
    this._shotCells = cells ?? this.getEmptyBoolCells();
  }

  /**
   * Установить клетку, в качестве отстреленной.
   * @param cellData - Координаты клетки
   */
  public setCellIsShot(cellData: ColRowData): void {
    this._shotCells[cellData.row][cellData.col] = true;
  }

  /**
   * Проверка, что в клетку можно выстрелить.
   * Если клетка отстрелена или не существует, вернется false.
   * @param cellData - Координаты клетки
   * @return boolean Возвращает true если в клетку можно выстрелить, иначе false.
   */
  public checkCellIsCanShot(cellData: ColRowData): boolean {
    return isValidColRowData(cellData)
      ? !this._shotCells[cellData.row][cellData.col]
      : false;
  }

  /**
   * Получить матрицу из клеток, заполненных false
   */
  private getEmptyBoolCells(): BoolCellsMatrix {
    return getFilledCellsMatrix<boolean>(false);
  }
}