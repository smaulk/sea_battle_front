import { ColRowData } from "@/interfaces/ColRowData.ts";
import Ship from "@/models/Ship.ts";
import ShipPlaceValidationService from "@/services/ShipPlaceValidationService.ts";

/**
 * Класс клетки, отвечающий за работу с HTML элементом клетки.
 */
export default class Cell {

  private readonly _cellData: ColRowData;
  private readonly _cellHtmlElem: HTMLDivElement;

  private constructor(cellData: ColRowData, cellElement: HTMLDivElement) {
    this._cellData = cellData;
    this._cellHtmlElem = cellElement;
  }

  get cellData(): ColRowData {
    return this._cellData;
  }

  get cellElem(): HTMLDivElement {
    return this._cellHtmlElem;
  }

  /** Создание экземпляра класса  */
  static create(cellData: ColRowData, cellElement: HTMLDivElement | null): Cell | null {
    if (cellData !== null && cellData.col !== null && cellData.row !== null
      && cellElement !== null) {
      return new Cell(cellData, cellElement);
    } else {
      return null;
    }
  }

  /** Добавить корабль в клетку */
  public appendShip(ship: Ship | null): void {
    if (!ship) return;
    this._cellHtmlElem.append(ship.shipElem);
  }

  /** Установить клетку, в качестве "занятой" */
  public setCellClassShip() {
    this.cellElem.classList.remove('battlefield-cell__empty');
    this.cellElem.classList.add('battlefield-cell__ship');

  }

  /** Установить клетку, в качестве "пустой" */
  public setCellClassEmpty() {
    this.cellElem.classList.remove('battlefield-cell__ship');
    this.cellElem.classList.add('battlefield-cell__empty');

  }

  /** Проверка, что в данную клетку можно установить корабль */
  public isValidPlace(shipPlaceValidationService: ShipPlaceValidationService, ship: Ship): boolean {
    return shipPlaceValidationService.checkCellForPlacement(ship.shipData, this._cellData);
  }

  /** Установить клетку, в качестве "промаха" */
  public setCellClassMiss() {
    this.cellElem.classList.remove('battlefield-cell__empty')
    this.cellElem.classList.add('battlefield-cell__miss');

  }

  /** Установить клетку, в качестве "автоматического промаха" */
  public setCellClassMissAuto() {
    this.cellElem.classList.remove('battlefield-cell__empty', 'battlefield-cell__miss')
    this.cellElem.classList.add('battlefield-cell__miss-auto');

  }

  /** Установить клетку, в качестве "попадания" */
  public setCellClassHit() {
    this.cellElem.classList.remove('battlefield-cell__empty')
    this.cellElem.classList.add('battlefield-cell__hit');

  }

  /** Установить клетку, в качестве "уничтоженной" */
  public setCellClassDestroyed() {
    this.cellElem.classList.remove(
      'battlefield-cell__empty',
      'battlefield-cell__miss',
      'battlefield-cell__miss-auto',
      'battlefield-cell__hit'
    );
    this.cellElem.classList.add('battlefield-cell__destroyed');

  }

  /** Установить клетку, в качестве "последней нажатой клетки" */
  public setCellClassLast() {
    this.cellElem.classList.add('battlefield-cell__last')
  }

  /** Убрать клетку, в качестве "последней нажатой клетки" */
  public removeCellClassLast() {
    this.cellElem.classList.remove('battlefield-cell__last')
  }

  /** Установить клетку, в качестве "разрешенной для размещения корабля" */
  public setShipAllowed() {
    this._cellHtmlElem.classList.add('battlefield-cell__ship-allowed');
  }

  /** Убрать клетку, в качестве "разрешенной для размещения корабля" */
  public removeShipAllowed() {
    this._cellHtmlElem.classList.remove('battlefield-cell__ship-allowed');
  }
}