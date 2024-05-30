import { ShipData } from "@/interfaces/ShipData.ts";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import { getColRowData } from "@/helpers";
import FindCellService from "@/services/FindCellService.ts";
import { Position } from "@/enums/Position.ts";

/**
 * Класс корабля, отвечающий за работу с данными корабля и его HTML элементом.
 */
export default class Ship {

  private readonly _shipData: ShipData;
  private readonly _shipHtmlElem: HTMLDivElement;

  private constructor(shipData: ShipData, shipElement: HTMLDivElement) {
    this._shipData = shipData;
    this._shipHtmlElem = shipElement;
    this.setPositionAttr(shipData.position);
  }

  get shipData(): ShipData {
    return this._shipData;
  }

  get shipElem(): HTMLDivElement {
    return this._shipHtmlElem;
  }

  /**
   * Создание экземпляра класса
   * @param shipData Данные корабля
   * @param isEmptyElement Создать новый пустой HTML элемент для корабля
   */
  static create(shipData: ShipData, isEmptyElement?: boolean): Ship | null {
    if (shipData && shipData.id !== null && shipData.size !== null
      && shipData.position !== null) {

      if (isEmptyElement) {
        return new Ship(shipData, this.createEmptyShipElement(shipData));
      }
      const elem = this.getShipElement(shipData.id);
      if (elem) return new Ship(shipData, elem);

    }
    return null;

  }

  /** Создать новый пустой HTML элемент корабля на основе его данных */
  public static createEmptyShipElement(shipData: ShipData) {
    const shipElem = document.createElement('div');
    shipElem.classList.add('ship', 'static');
    shipElem.dataset.size = shipData.size.toString();
    shipElem.dataset.position = shipData.position;
    return shipElem;
  }

  /** Получить HTML элемент корабля по его id */
  private static getShipElement(shipId: number): HTMLDivElement | null {
    return document.querySelector(`.ship[data-id="${shipId}"]`);
  }

  /** Проверка, что корабль перемещается */
  public isDragging(): boolean {
    return this._shipHtmlElem.classList.contains('dragging');
  }

  /** Получить данные клетки, в которой находится корабль */
  public getCurrentColRowData(): ColRowData | null {
    const parent: HTMLDivElement = this._shipHtmlElem.offsetParent as HTMLDivElement;
    return getColRowData(parent);
  }

  /** Получить данные клетки в текущих координатах */
  public getNewColRowData(findCellPlacementService: FindCellService, event: MouseEvent | TouchEvent): ColRowData | null {
    return findCellPlacementService.findCellToPlace(event, this._shipHtmlElem);
  }

  /** Поменять позицию корабля */
  public changePosition() {
    this._shipData.position = this.shipData.position === Position.Horizontal ? Position.Vertical : Position.Horizontal;
    this.setPositionAttr(this._shipData.position);
  }

  /** Установить класс "запрета размещения корабля" */
  public setClassForbidden(): void {
    this.removeClasses('ship-place-allowed');
    this.addClasses('ship-place-forbidden');
  }

  /** Установить класс "разрешения размещения корабля" */
  public setClassAllowed(): void {
    this.removeClasses('ship-place-forbidden');
    this.addClasses('ship-place-allowed');
  }

  /** Установить класс "перемещаемый" */
  public setDragging(): void {
    this.addClasses('dragging', 'ship-place-forbidden')
  }

  /** Убрать класс "перемещаемый" */
  public removeDragging(): void {
    this.removeClasses('dragging', 'ship-place-allowed', 'ship-place-forbidden');
  }

  /** Установить анимацию "запрета поворота корабля" */
  public setAnimateTurnForbidden(): void {
    //Добавляем анимацию
    this.setClassForbidden();
    this.addClasses('shake-animation')

    const removeAnimate = () => { //Убираем анимацию
      this.removeClasses('ship-place-forbidden', 'shake-animation');
      this._shipHtmlElem.removeEventListener('mousedown', removeAnimate);
      this._shipHtmlElem.removeEventListener('touchstart', removeAnimate);
      this._shipHtmlElem.removeEventListener('animationend', removeAnimate);
    }
    //Чтобы при нажатии анимация убиралась
    this._shipHtmlElem.addEventListener('mousedown', removeAnimate);
    this._shipHtmlElem.addEventListener('touchstart', removeAnimate);
    //Чтобы при завершении анимация убиралась
    this._shipHtmlElem.addEventListener('animationend', removeAnimate);
  }

  /** Добавить классы к HTML элементу корабля*/
  private addClasses(...classes: string[]): void {
    this._shipHtmlElem.classList.add(...classes);
  }

  /** Убрать классы из HTML элемента корабля*/
  private removeClasses(...classes: string[]): void {
    this._shipHtmlElem.classList.remove(...classes);
  }

  /** Установить данную позицию в атрибут HTML элемента корабля */
  private setPositionAttr(position: Position): void {
    this._shipHtmlElem.dataset.position = position;
  }
}