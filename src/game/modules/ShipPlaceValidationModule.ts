import type {ShipData} from "../interfaces/ShipData";
import {ColRowData} from "../interfaces/ColRowData";
import {getAroundCells, getShipCells, isValidIndex} from "../utils";
import {CellsMatrix} from "../interfaces/CellsMatrix";

/*
    Модуль, отвечающий за проверку возможности размещения кораблей в клетках.
 */
export default class ShipPlaceValidationModule {

    private readonly _cells: CellsMatrix;

    constructor(cells: CellsMatrix) {
        this._cells = cells;
    }

    /*
        Проверка клетки, на возможность установки корабля.
        @param shipData Данные корабля
        @param cellData Данные клетки, которая будет начальной клеткой корабля
     */
    public checkCellForPlacement(shipData: ShipData, cellData: ColRowData): boolean {
        const shipCells: Array<ColRowData> = getShipCells(cellData, shipData);
        for(const cell of shipCells){
            if (!this.checkCells(cell)) return false;
        }
        return true;
    }

    /*
        Проверка клеток вокруг, на возможность размещения корабля в данную клетку.
        @return true В данную клетку можно установить корабль
        @return false В данную клетку нельзя установить корабль
     */
    private checkCells(cellData: ColRowData): boolean {
        const isEmptyCell = (cellData: ColRowData): boolean =>
            this._cells[cellData.row][cellData.col] === null;
        //Проверка, что данная клетка валидна и не занята
        if (!(isValidIndex(cellData.col) && isValidIndex(cellData.row)
            && isEmptyCell(cellData))) {
            return false;
        }

        const aroundCells = getAroundCells(cellData);
        //Если окружающая клетка не пустая, возвращаем false
        for(let cell of aroundCells){
            if(!isEmptyCell(cell)) return false;
        }
        return true;
    }

}