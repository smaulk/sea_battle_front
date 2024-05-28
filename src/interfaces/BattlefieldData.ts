import { ShipData } from "./ShipData.ts";
import { CellsMatrix } from "./CellsMatrix.ts";

/**
 * Данные об игровом поле
 */
export interface BattlefieldData {
  cells: CellsMatrix,
  ships: Array<ShipData>,
}