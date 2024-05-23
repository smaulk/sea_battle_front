import type {ShipData} from "../interfaces/ShipData";
import {ColRowData} from "../interfaces/ColRowData";
import {getAroundCells, getShipCells, isValidIndex} from "./Functions";
import {CellsMatrix} from "../interfaces/CellsMatrix";

export default class ShipPlaceValidationModule {

    private readonly _cells: CellsMatrix;

    constructor(cells: CellsMatrix) {
        this._cells = cells;
    }

    public checkCellsForPlacement(shipData: ShipData, cellData: ColRowData): boolean {
        const shipCells = getShipCells(cellData, shipData);
        for(const cell of shipCells){
            if (!this.checkCells(cell)) return false;
        }
        return true;
    }


    private checkCells(cellData: ColRowData): boolean {
        const isEmptyCell = (cellData: ColRowData): boolean =>
            this._cells[cellData.row][cellData.col] === null;

        if (!(isValidIndex(cellData.col) && isValidIndex(cellData.row)
            && isEmptyCell(cellData))) {
            return false;
        }

        const aroundCells = getAroundCells(cellData);

        for(let cell of aroundCells){
            if(!isEmptyCell(cell)) return false;
        }
        return true;
    }

}