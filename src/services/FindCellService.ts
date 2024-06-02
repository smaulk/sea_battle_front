import { getColRowData } from "@/helpers";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import { config } from "@/config.ts";

/**
 * Сервис, отвечающий за поиск клетки в координатах курсора.
 */
export default class FindCellService {
  //Количество клеток в ряду
  private readonly cellCount: number;
  //Массив HTML элементов клеток
  private readonly cellElements: Array<HTMLDivElement>;

  constructor(cellElements: Array<HTMLDivElement>) {
    this.cellElements = cellElements;
    this.cellCount = config.countCells;
  }

  /**
   * Получить данные клетки в текущих координатах.
   * @param event Event при перемещении
   * @param shipElem HTML элемент корабля
   */
  public findCellToPlace(event: MouseEvent | TouchEvent, shipElem: HTMLDivElement): ColRowData | null {
    const idY = this.findOnY(event, shipElem);
    //Если ряд клетки найден
    if (idY !== null) {
      return this.findOnX(event, shipElem, idY);
    }
    return null;
  }

  /**
   * Поиск ряда клетки (поиск по оси Y).
   */
  private findOnY(event: MouseEvent | TouchEvent, shipElem: HTMLDivElement): number | null {
    const cellElements = this.cellElements;
    const rect = shipElem.getBoundingClientRect();
    const pageY = event instanceof MouseEvent ? event.pageY : event.changedTouches[0].pageY;
    const offsetY = pageY - rect.top - cellElements[0].getBoundingClientRect().width / 2;
    const Y = pageY - offsetY;

    for (let i = 0; i < cellElements.length; i += this.cellCount) {
      let elem = cellElements[i];
      // Получаем координаты верхней и нижней границы элемента
      let elemTop = elem.getBoundingClientRect().top;
      let elemBottom = elem.getBoundingClientRect().bottom;
      // Если курсор или касание находится в пределах верхней и нижней границ элемента
      if (elemTop <= Y && Y < elemBottom) {
        return i;
      }
    }

    return null;
  }

  /**
   * Поиск клетки в данном ряду (поиск по оси X).
   */
  private findOnX(event: MouseEvent | TouchEvent, shipElem: HTMLDivElement, yId: number): ColRowData | null {
    const cellElements = this.cellElements;
    const rect = shipElem.getBoundingClientRect();
    const pageX = event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;
    const offsetX = pageX - rect.left - cellElements[0].getBoundingClientRect().width / 2;
    const X = pageX - offsetX;

    for (let i = yId; i < yId + this.cellCount; i++) {
      let elem: HTMLDivElement = cellElements[i];
      // Получаем координаты левой и правой границ элемента
      let elemLeft = elem.getBoundingClientRect().left;
      let elemRight = elem.getBoundingClientRect().right;
      // Если курсор или касание находится в пределах левой и правой границ элемента
      if (elemLeft <= X && X < elemRight) {
        return getColRowData(elem);
      }
    }

    return null;
  }
}