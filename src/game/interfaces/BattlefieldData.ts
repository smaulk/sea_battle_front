import {ShipData} from "./ShipData";
import {CellsMatrix} from "./CellsMatrix";

/*
    Данные об игровом поле
 */
export interface BattlefieldData{
    cells: CellsMatrix,
    ships: Array<ShipData>,
}