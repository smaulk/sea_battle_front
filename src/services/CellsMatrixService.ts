import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import { getFilledCellsMatrix, isValidColRowData } from "@/helpers";

/**
 * Сервис, отвечающий за работу с матрицей клеток, хранящих id корабля.
 */
export default class CellsMatrixService {

  private readonly _cells: CellsMatrix;

  constructor(cells?: CellsMatrix) {
    this._cells = cells ?? [];
    if (this._cells.length === 0) {
      this._cells.push(...this.getEmptyCells());
    }
  }

  protected get cells(): CellsMatrix {
    return this._cells;
  }

  /**
   * Записать данные в данную клетку.
   * @param cellData - Координаты клетки.
   * @param data - Данные, которые будут записаны в клетку.
   */
  protected setShipIdInCell(cellData: ColRowData, data: number | null): void {
    this._cells[cellData.row][cellData.col] = data;
  }

  /**
   * Получить данные из данной клетки.
   * @param cellData - Координаты клетки.
   * @return number - Id корабля
   * @return null - Клетка пуста
   * @return undefined - Клетки не существует
   */
  protected getShipIdFromCell(cellData: ColRowData): number | null | undefined {
    return (isValidColRowData(cellData))
      ? this._cells[cellData.row][cellData.col]
      : undefined;
  }

  /**
   * Очистка матрицы клеток.
   */
  protected clearCells(): void {
    this._cells.splice(0, this._cells.length, ...this.getEmptyCells());
  }

  /**
   * Получить матрицу из клеток, заполненных null
   */
  private getEmptyCells(): CellsMatrix {
    return getFilledCellsMatrix<number | null>(null);
  }
}