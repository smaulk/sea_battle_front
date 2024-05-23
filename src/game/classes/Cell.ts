import {ColRowData} from "../interfaces/ColRowData";
import Ship from "./Ship";
import ShipPlaceValidationModule from "../modules/ShipPlaceValidationModule";


export default class Cell {

    private readonly _cellData: ColRowData;
    get cellData(): ColRowData {
        return this._cellData;
    }

    private readonly _cellHtmlElem: HTMLDivElement;

    get cellElem(): HTMLDivElement {
        return this._cellHtmlElem;
    }

    private constructor(cellData: ColRowData, cellElement: HTMLDivElement) {
        this._cellData = cellData;
        this._cellHtmlElem = cellElement;
    }

    // Фабричный метод для создания экземпляра класса
    static create(cellData: ColRowData, cellElement: HTMLDivElement | null): Cell | null {
        if (cellData !== null && cellData.col !== null && cellData.row !== null
            && cellElement !== null) {
            return new Cell(cellData, cellElement);
        } else {
            return null;
        }
    }


    public appendShip(ship: Ship | null): void {
        if (!ship) return;
        this._cellHtmlElem.append(ship.shipElem);
    }


    public setCellClassShip() {
        this.cellElem.classList.remove('battlefield-cell__empty');
        this.cellElem.classList.add('battlefield-cell__ship');

    }

    public setCellClassEmpty() {
        this.cellElem.classList.remove('battlefield-cell__ship');
        this.cellElem.classList.add('battlefield-cell__empty');

    }

    public isValidPlace(shipPlaceValidationModule: ShipPlaceValidationModule, ship: Ship): boolean {
        return shipPlaceValidationModule.checkCellsForPlacement(ship.shipData, this._cellData);
    }

    public setCellClassMiss() {
        this.cellElem.classList.remove('battlefield-cell__empty')
        this.cellElem.classList.add('battlefield-cell__miss');

    }

    public setCellClassMissAuto() {
        this.cellElem.classList.remove('battlefield-cell__empty', 'battlefield-cell__miss')
        this.cellElem.classList.add('battlefield-cell__miss-auto');

    }

    public setCellClassHit() {
        this.cellElem.classList.remove('battlefield-cell__empty')
        this.cellElem.classList.add('battlefield-cell__hit');

    }

    public setCellClassDestroyed() {
        this.cellElem.classList.remove(
            'battlefield-cell__empty',
            'battlefield-cell__miss',
            'battlefield-cell__miss-auto',
            'battlefield-cell__hit'
        );
        this.cellElem.classList.add('battlefield-cell__destroyed');

    }

    public setCellClassLast() {
        this.cellElem.classList.add('battlefield-cell__last')
    }

    public removeCellClassLast() {
        this.cellElem.classList.remove('battlefield-cell__last')
    }

    public setShipAllowed() {
        this._cellHtmlElem.classList.add('battlefield-cell__ship-allowed');
    }

    public removeShipAllowed() {
        this._cellHtmlElem.classList.remove('battlefield-cell__ship-allowed');
    }
}