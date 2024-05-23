import {ShipData} from "../interfaces/ShipData";
import {ColRowData} from "../interfaces/ColRowData";
import {getColRowData} from "../modules/Functions";
import FindCellPlacementModule from "../modules/FindCellPlacementModule";
import {Position} from "../enums/Position";

export default class Ship {

    private readonly _shipData: ShipData;
    get shipData(): ShipData {
        return this._shipData;
    }

    private readonly _shipHtmlElem: HTMLDivElement;

    get shipElem(): HTMLDivElement {
        return this._shipHtmlElem;
    }

    private constructor(shipData: ShipData, shipElement: HTMLDivElement) {
        this._shipData = shipData;
        this._shipHtmlElem = shipElement;
        this.setPositionAttr(shipData.position);
    }

    static create(shipData: ShipData, isEmptyElement?: Boolean): Ship | null {
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


    private static getShipElement(shipId: number): HTMLDivElement | null {
        return document.querySelector(`.ship[data-id="${shipId}"]`);
    }

    public static createEmptyShipElement(shipData: ShipData) {
        const shipElem = document.createElement('div');
        shipElem.classList.add('ship');
        shipElem.dataset.size = shipData.size.toString();
        shipElem.dataset.position = shipData.position;
        return shipElem;
    }

    public isDragging(): boolean {
        return this._shipHtmlElem.classList.contains('dragging');
    }

    public getCurrentColRowData(): ColRowData | null {
        const parent: HTMLDivElement = this._shipHtmlElem.offsetParent as HTMLDivElement;
        return getColRowData(parent);
    }


    public getNewColRowData(findCellPlacementModule: FindCellPlacementModule, event: MouseEvent | TouchEvent): ColRowData | null {
        return findCellPlacementModule.findCellToPlace(event, this._shipHtmlElem);
    }

    private addClass(...classes: string[]): void {
        this._shipHtmlElem.classList.add(...classes);
    }

    private removeClass(...classes: string[]): void {
        this._shipHtmlElem.classList.remove(...classes);
    }

    private setPositionAttr(position: Position): void {
        this._shipHtmlElem.dataset.position = position;
    }

    public changePosition() {
        this._shipData.position = this.shipData.position === Position.Horizontal ? Position.Vertical : Position.Horizontal;
        this.setPositionAttr(this._shipData.position);
    }

    public setClassForbidden(): void {
        this.removeClass('ship-place-allowed');
        this.addClass('ship-place-forbidden');
    }

    public setClassAllowed(): void {
        this.removeClass('ship-place-forbidden');
        this.addClass('ship-place-allowed');
    }

    public setDragging(): void {
        this.addClass('dragging', 'ship-place-forbidden')
    }

    public removeDragging(): void {
        this.removeClass('dragging', 'ship-place-allowed', 'ship-place-forbidden');
    }

    public setAnimateForbidden(): void {
        //Добавляем анимацию
        this.setClassForbidden();
        this.addClass('shake-animation')

        const removeAnimate = () => { //Убираем анимацию
            this.removeClass('ship-place-forbidden', 'shake-animation');
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
}