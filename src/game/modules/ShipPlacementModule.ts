import {ColRowData} from "../interfaces/ColRowData";
import Ship from "../classes/Ship";
import ShipPlaceValidationModule from "./ShipPlaceValidationModule";
import {Position} from "../enums/Position";
import Cell from "../classes/Cell";
import {ShipData} from "../interfaces/ShipData";
import {getEmptyCells, getStartCellShip} from "./Functions";
import CellCreator from "../classes/CellCreator";
import {CellsMatrix} from "../interfaces/CellsMatrix";

export default class ShipPlacementModule {

    private readonly shipValidation: ShipPlaceValidationModule;
    private _cells: CellsMatrix;
    private _oldCell: Cell | null;
    private cellCreator: CellCreator;

    constructor(cells: CellsMatrix, cellCreator: CellCreator) {
        this.shipValidation = new ShipPlaceValidationModule(cells);
        this._cells = cells;
        this._oldCell = null;
        this.cellCreator = cellCreator;
    }


    public placeShipToCell(cellData: ColRowData, ship: Ship): boolean {
        const cell: Cell | null = this.cellCreator.create(cellData);
        if (!ship || !cell) return false;

        if (cell.isValidPlace(this.shipValidation, ship)) {
            this.placeToCells(cell, ship);
            return true;
        }
        return false;
    }

    private getNewCellData(cellData: ColRowData, position: Position, offset: number): ColRowData {
        return {
            col: position === Position.Horizontal ? cellData.col + offset : cellData.col,
            row: position === Position.Vertical ? cellData.row + offset : cellData.row,
        };
    }

    private placeToCells(cell: Cell | null, ship: Ship | null): void {
        if (!cell || !ship) return;
        cell.appendShip(ship);

        for (let i = 0; i < ship.shipData.size; i++) {
            const newCellData: ColRowData = this.getNewCellData(cell.cellData, ship.shipData.position, i);
            this.placeShip(this.cellCreator.create(newCellData), ship);
        }
    }


    private placeShip(cell: Cell | null, ship: Ship): void {
        if (!cell || !ship) return;
        cell.setCellClassShip();
        this.setShipIdInCell(cell, ship.shipData.id)
    }


    public removeShipFromCell(cellData: ColRowData, ship: Ship): void {
        const cell = this.cellCreator.create(cellData);
        if (!ship || !cell) return;

        for (let i = 0; i < ship.shipData.size; i++) {
            const newCellData = this.getNewCellData(cell.cellData, ship.shipData.position, i);
            this.removeShip(this.cellCreator.create(newCellData));
        }
    }

    private removeShip(cell: Cell | null): void {
        if (!cell) return;
        this.setShipIdInCell(cell, null);
        cell.setCellClassEmpty();
    }


    private setShipIdInCell(cell: Cell, shipId: number | null): void {
        this._cells[cell.cellData.row][cell.cellData.col] = shipId;
    }


    public placeShipCheck(cellData: ColRowData, ship: Ship): boolean {
        const cell = this.cellCreator.create(cellData);
        if (!ship || !cell) return false;

        if (cell.isValidPlace(this.shipValidation, ship)) {
            this.placeShipAllowed(cell, ship)
            ship.setClassAllowed()
            return true;
        }

        ship.setClassForbidden();
        return false;
    }


    private placeShipAllowed(cell: Cell, ship: Ship): void {
        this._oldCell = cell;

        for (let i = 0; i < ship.shipData.size; i++) {
            const newCellData: ColRowData = this.getNewCellData(cell.cellData, ship.shipData.position, i);
            const newCell: Cell | null = this.cellCreator.create(newCellData);
            if (newCell) newCell.setShipAllowed();
        }
    }

    public removeShipAllowed(ship: Ship): void {
        if (!this._oldCell) return;

        for (let i = 0; i < ship.shipData.size; i++) {
            const newCellData: ColRowData = this.getNewCellData(this._oldCell.cellData, ship.shipData.position, i);
            const newCell: Cell | null = this.cellCreator.create(newCellData);
            if(newCell) newCell.removeShipAllowed();
        }
    }

    private clearCellsArray(): void {
        this._cells.splice(0, this._cells.length, ...getEmptyCells());
    }


    public placeShipsFromCells(cells: CellsMatrix, ships: Array<ShipData>): void {
        if (!cells || !ships) return;
        this.clearCellsArray();

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