import { ColRowData } from "@/interfaces/ColRowData.ts";
import { ShotData } from "@/interfaces/ShotData.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";
import { ShipData } from "@/interfaces/ShipData.ts";
import { ShotStatus } from "@/enums/ShotStatus.ts";
import { getStartCellShip } from "@/helpers";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";

/**
 * Модуль, отвечающий за выстрел по полю.
 * Хранит данные поля и кораблей, и обрабатывает выстрел по полю.
 */
export default class ShotController{
  private readonly _cells: CellsMatrix;
  private _ships: Array<ShipData>;
  private readonly _hitsOnShips: Array<number> = [];
  private _destroyedShipsCount: number = 0;

  get isAllDestroyed(): boolean {
    return this._destroyedShipsCount === this._ships.length;
  }

  constructor(battlefieldData: BattlefieldData) {
    this._cells = battlefieldData.cells;
    this._ships = battlefieldData.ships;

    for (let ship of battlefieldData.ships) {
      this._hitsOnShips[ship.id] = 0;
    }
  }

  /**
   * Получить id корабля в данной клетке или null.
   */
  private getShipInCells(cellData: ColRowData): number | null {
    return this._cells[cellData.row][cellData.col];
  }

  /**
   * Увеличить количество уничтоженных кораблей.
   */
  private addDestroyedShip(): void {
    this._destroyedShipsCount++;
  }

  /**
   * Выстрел по клетке.
   * @param cellData Данные клетки, в которую будет совершен выстрел
   */
  public shot(cellData: ColRowData): ShotData {
    const shipId = this.getShipInCells(cellData);

    if (shipId) {
      const shipData = this._ships.find(ship => ship.id === shipId);
      if (shipData) {
        this._hitsOnShips[shipId]++;
        let startCellData = null;
        let shot = ShotStatus.Hit;
        //Если корабль уничтожен
        if (this._hitsOnShips[shipId] === shipData.size) {
          startCellData = getStartCellShip(this._cells, shipId);
          shot = ShotStatus.Destroyed;
          this.addDestroyedShip();
        }
        return {
          shot: shot,
          ship: shipData,
          startCell: startCellData,
        };
      }
    }
    //Возвращаем промах
    return {
      shot: ShotStatus.Miss,
      ship: null,
      startCell: null
    };
  }
}