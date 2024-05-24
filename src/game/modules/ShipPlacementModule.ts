import {ColRowData} from "../interfaces/ColRowData";
import Ship from "../classes/Ship";
import ShipPlaceValidationModule from "./ShipPlaceValidationModule";
import Cell from "../classes/Cell";
import {ShipData} from "../interfaces/ShipData";
import {getEmptyCells, getNewCellData, getStartCellShip} from "../utils";
import CellCreator from "../classes/CellCreator";
import {CellsMatrix} from "../interfaces/CellsMatrix";

/*
    Модуль, отвечающий за размещение кораблей на поле.
 */
export default class ShipPlacementModule {

    private readonly shipValidation: ShipPlaceValidationModule;
    private readonly _cells: CellsMatrix;
    //Клетка, которая была использована для проверки размещения корабля
    private _oldCell: Cell | null;
    private cellCreator: CellCreator;

    constructor(cells: CellsMatrix, cellCreator: CellCreator) {
        this.shipValidation = new ShipPlaceValidationModule(cells);
        this._cells = cells;
        this._oldCell = null;
        this.cellCreator = cellCreator;
    }

    /*
        Размещение корабля в клетке с проверкой возможности размещения.

        При успешном размещении - true, при неудаче - false;
     */
    public placeShipToCell(cellData: ColRowData, ship: Ship): boolean {
        const cell: Cell | null = this.cellCreator.create(cellData);
        if (!ship || !cell) return false;

        if (cell.isValidPlace(this.shipValidation, ship)) {
            this.placeToCells(cell, ship);
            return true;
        }
        return false;
    }

    /*
        Размещение корабля в клетках.
     */
    private placeToCells(cell: Cell | null, ship: Ship | null): void {
        if (!cell || !ship) return;
        cell.appendShip(ship);

        for (let i = 0; i < ship.shipData.size; i++) {
            const newCellData: ColRowData = getNewCellData(cell.cellData, ship.shipData.position, i);
            this.placeShip(this.cellCreator.create(newCellData), ship);
        }
    }

    /*
        Установка наличия кораблей в клетке.
     */
    private placeShip(cell: Cell | null, ship: Ship): void {
        if (!cell || !ship) return;
        cell.setCellClassShip();
        this.setShipIdInCell(cell, ship.shipData.id)
    }

    /*
        Удаление корабля из клеток.
     */
    public removeShipFromCell(cellData: ColRowData, ship: Ship): void {
        const cell = this.cellCreator.create(cellData);
        if (!ship || !cell) return;

        for (let i = 0; i < ship.shipData.size; i++) {
            const newCellData = getNewCellData(cell.cellData, ship.shipData.position, i);
            this.removeShip(this.cellCreator.create(newCellData));
        }
    }

    /*
        Удаление корабля из клетки
     */
    private removeShip(cell: Cell | null): void {
        if (!cell) return;
        this.setShipIdInCell(cell, null);
        cell.setCellClassEmpty();
    }

    /*
        Запись id корабля в матрицу клеток.
     */
    private setShipIdInCell(cell: Cell, shipId: number | null): void {
        this._cells[cell.cellData.row][cell.cellData.col] = shipId;
    }

    /*
        Отображение возможных для размещения корабля клеток, либо отображение невозможности размещения.
     */
    public checkShipPlacing(cellData: ColRowData, ship: Ship): boolean {
        const cell = this.cellCreator.create(cellData);
        if (!ship || !cell) return false;

        if (cell.isValidPlace(this.shipValidation, ship)) {
            this.setAllowedCells(cell, ship)
            ship.setClassAllowed()
            return true;
        }

        ship.setClassForbidden();
        return false;
    }

    /*
        Отображение клеток, в которых можно разместить корабли.
     */
    private setAllowedCells(cell: Cell, ship: Ship): void {
        this._oldCell = cell;

        for (let i = 0; i < ship.shipData.size; i++) {
            const newCellData: ColRowData = getNewCellData(cell.cellData, ship.shipData.position, i);
            const newCell: Cell | null = this.cellCreator.create(newCellData);
            if (newCell) newCell.setShipAllowed();
        }
    }

    /*
        Очистка клеток, которые были помечены как возможные для размещения клеток.
     */
    public removeAllowedCells(ship: Ship): void {
        if (!this._oldCell) return;

        for (let i = 0; i < ship.shipData.size; i++) {
            const newCellData: ColRowData = getNewCellData(this._oldCell.cellData, ship.shipData.position, i);
            const newCell: Cell | null = this.cellCreator.create(newCellData);
            if(newCell) newCell.removeShipAllowed();
        }
    }

    /*
        Очистка матрицы клеток.
     */
    private clearCellsMatrix(): void {
        this._cells.splice(0, this._cells.length, ...getEmptyCells());
    }

    /*
        Размещение кораблей на поле из матрицы клеток.
     */
    public placeShipsFromCells(cells: CellsMatrix, ships: Array<ShipData>): void {
        if (!cells || !ships) return;
        this.clearCellsMatrix();

        const placedShips = new Set<number | null>();

        for (const shipData of ships) {
            if (!placedShips.has(shipData.id)) {
                const startCellData: ColRowData | null = getStartCellShip(cells, shipData.id);
                if (startCellData) {
                    this.placeToCells(this.cellCreator.create(startCellData), Ship.create(shipData));
                    placedShips.add(shipData.id);
                }
            }
        }
    }

}