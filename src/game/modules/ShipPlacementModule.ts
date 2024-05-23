import {ColRowData} from "../interfaces/ColRowData";
import Ship from "../classes/Ship";
import ShipPlaceValidationModule from "./ShipPlaceValidationModule";
import {Position} from "../enums/Position";
import Cell from "../classes/Cell";
import {ShipData} from "../interfaces/ShipData";
import {getEmptyCells} from "./Functions";
import CellCreator from "../classes/CellCreator";
import {CellsMatrix} from "../interfaces/CellsMatrix";

export default class ShipPlacementModule {

    private readonly shipValidation: ShipPlaceValidationModule;
    private _cells: CellsMatrix;
    private _oldCell: Cell | null;
    private cellCreator: CellCreator;

    constructor(cells: CellsMatrix, cellCreator: CellCreator) {
        this.shipValidation = new ShipPlaceValidationModule(cells);
        this.shipValidation = new ShipPlaceValidationModule(cells);
        this._cells = cells;
        this._oldCell = null;
        this.cellCreator = cellCreator;
    }



    public placeShipToCell(cellData: ColRowData, ship: Ship): boolean {
        const cell = this.cellCreator.create(cellData);
        if (ship === null || cell === null) {
            return false;
        }

        const isValid = cell.isValidPlace(this.shipValidation, ship);

        if (isValid) {
            this.placeToCells(cell, ship);
            return true;
        }

        return false;
    }

    private placeToCells(cell: Cell | null, ship: Ship | null) {
        if(!cell || !ship) return;
        cell.appendShip(ship);

        for (let i = 0; i < ship.shipData.size; i++) {
            let newCellData: ColRowData = {
                col: ship.shipData.position === Position.Horizontal ? cell.cellData.col + i : cell.cellData.col,
                row: ship.shipData.position === Position.Vertical ? cell.cellData.row + i : cell.cellData.row,
            };

            this.placeShip(this.cellCreator.create(newCellData), ship);
        }

    }


    private placeShip(cell: Cell | null, ship: Ship): void {
        if (!cell) return;
        cell.setCellClassShip();
        this.setShipIdInCell(cell, ship.shipData.id)
    }


    public removeShipFromCell(cellData: ColRowData, ship: Ship): void {
        const cell = this.cellCreator.create(cellData);
        if (ship === null || cell === null) {
            return;
        }

        for (let i = 0; i < ship.shipData.size; i++) {
            let newCellData: ColRowData = {
                col: ship.shipData.position === Position.Horizontal ? cell.cellData.col + i : cell.cellData.col,
                row: ship.shipData.position === Position.Vertical ? cell.cellData.row + i : cell.cellData.row,
            };

            this.removeShip(this.cellCreator.create(newCellData));
        }


    }

    private removeShip(cell: Cell| null): void {
        if(!cell) return;
        this.setShipIdInCell(cell, null);
        cell.setCellClassEmpty();
    }


    private setShipIdInCell(cell: Cell, shipId: number | null): void {
        this._cells[cell.cellData.row][cell.cellData.col] = shipId;
    }


    public placeShipCheck(cellData: ColRowData, ship: Ship): boolean {
        const cell = this.cellCreator.create(cellData);
        if (ship === null || cell === null) return false;

        const isValid = cell.isValidPlace(this.shipValidation, ship);

        if (isValid) {
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
            let newCellData: ColRowData = {
                col: ship.shipData.position === Position.Horizontal ? cell.cellData.col + i : cell.cellData.col,
                row: ship.shipData.position === Position.Vertical ? cell.cellData.row + i : cell.cellData.row,
            };

            this.putShipAllowed(this.cellCreator.create(newCellData));
        }

    }

    private putShipAllowed(cell: Cell | null): void {
        if(!cell) return;
        cell.setShipAllowed();
    }


    public removeShipAllowed(ship: Ship): void {
        if (this._oldCell === null) return;

        for (let i = 0; i < ship.shipData.size; i++) {
            let newCellData: ColRowData = {
                col: ship.shipData.position === Position.Horizontal ? this._oldCell.cellData.col + i : this._oldCell.cellData.col,
                row: ship.shipData.position === Position.Vertical ? this._oldCell.cellData.row + i : this._oldCell.cellData.row,
            };

            this.removeCellAllowed(this.cellCreator.create(newCellData));
        }

    }

    private removeCellAllowed(cell: Cell | null) {
        if(!cell) return;
        cell.removeShipAllowed();
    }


    private clearCellsArray(): void{
        const emptyCells = getEmptyCells();
        this._cells.splice(0, this._cells.length);
        this.pushCellsArray(emptyCells)
    }

    private pushCellsArray(cells : CellsMatrix): void{
        this._cells.push(...cells);
    }


    public placeShipsFromCells(cells: CellsMatrix, ships: Array<ShipData>) {
        if(cells === null || ships === null) return;
        this.clearCellsArray();

        const size = cells.length;
        const shipPositions: Array<{id: number | null, startCellData: ColRowData}> = [];

        // Iterate through each cell
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                // If the cell contains a ship
                if (cells[row][col] !== null) {
                    // Check if this ship is already in the list
                    const shipId = cells[row][col];
                    const existingShip = shipPositions.find(ship => ship.id === shipId);

                    // If the ship is not in the list, add it
                    if (!existingShip) {
                        shipPositions.push({
                            id: shipId,
                            startCellData: { row, col },
                        });
                    }
                }
            }
        }

        // Now we have ship positions, we can place ships based on these positions
        for (const shipPosition of shipPositions) {
            const shipData = ships.find(ship => ship.id === shipPosition.id);
            if (shipData) {
                this.placeToCells(this.cellCreator.create(shipPosition.startCellData), Ship.create(shipData))
            }
        }
    }

}