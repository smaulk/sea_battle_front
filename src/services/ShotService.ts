import { ColRowData } from "@/interfaces/ColRowData.ts";
import { ShotData } from "@/interfaces/ShotData.ts";
import { ShipData } from "@/interfaces/ShipData.ts";
import { ShotStatus } from "@/enums/ShotStatus.ts";
import { getStartCellShip } from "@/helpers";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";
import CellsMatrixService from "@/services/CellsMatrixService.ts";

/**
 * Сервис, отвечающий за выстрел по полю.
 * Хранит данные поля и кораблей, и обрабатывает выстрел по полю.
 */
export default class ShotService extends CellsMatrixService {
  private _ships: Array<ShipData>;
  private readonly _hitsOnShips: Array<number> = [];
  private _destroyedShipsCount: number = 0;

  constructor(battlefieldData: BattlefieldData) {
    super(battlefieldData.cells)
    this._ships = battlefieldData.ships;
    for (let ship of battlefieldData.ships) {
      this._hitsOnShips[ship.id] = 0;
    }
  }

  get isAllDestroyed(): boolean {
    return this._destroyedShipsCount === this._ships.length;
  }

  /**
   * Выстрел по клетке.
   * @param cellData Данные клетки, в которую будет совершен выстрел
   */
  public shot(cellData: ColRowData): ShotData {
    const shipId = this.getShipIdFromCell(cellData);

    if (shipId) {
      const shipData = this._ships.find(ship => ship.id === shipId);
      if (shipData) {
        this._hitsOnShips[shipId]++;
        let startCellData = null;
        let shot = ShotStatus.Hit;
        //Если корабль уничтожен
        if (this._hitsOnShips[shipId] === shipData.size) {
          startCellData = getStartCellShip(this.cells, shipId);
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

  /**
   * Увеличить количество уничтоженных кораблей.
   */
  private addDestroyedShip(): void {
    this._destroyedShipsCount++;
  }
}