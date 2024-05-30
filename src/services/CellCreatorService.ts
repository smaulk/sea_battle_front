import { ColRowData } from "@/interfaces/ColRowData.ts";
import Cell from "@/models/Cell.ts";

/**
 * Сервис, отвечающий за создание экземпляров класса Cell,
 * на основе заданного массива HTML элементов клеток.
 */
export default class CellCreatorService {
  private readonly cellElements: Array<HTMLDivElement>;

  /**
   * @param cellElements Массив HTML элементов клеток
   */
  constructor(cellElements: Array<HTMLDivElement>) {
    this.cellElements = cellElements;
  }

  /**  Создание экземпляра класса Cell  */
  public create(cellData: ColRowData): Cell | null {
    const elem = this.getElementByCellData(cellData);
    return Cell.create(cellData, elem);
  }

  /** Получение HTML элемента клетки из массива, на основе данных клетки */
  private getElementByCellData(cellData: ColRowData): HTMLDivElement | null {
    const selector = `.battlefield-cell[data-row="${cellData.row}"][data-col="${cellData.col}"]`;

    for (const elem of this.cellElements) {
      if (elem.matches(selector)) {
        return elem;
      }
    }
    return null;
  }


}