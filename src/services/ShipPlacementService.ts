import { ColRowData } from "@/interfaces/ColRowData.ts";
import Ship from "@/models/Ship.ts";
import ShipPlaceValidationService from "@/services/ShipPlaceValidationService.ts";
import Cell from "@/models/Cell.ts";
import { getNewCellData, getStartCellShip } from "@/helpers";
import CellCreatorService from "@/services/CellCreatorService.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";
import CellsMatrixService from "@/services/CellsMatrixService.ts";

/**
 * Сервис, отвечающий за размещение кораблей на поле.
 */
export default class ShipPlacementService extends CellsMatrixService {

  private readonly shipValidation: ShipPlaceValidationService;
  //Клетка, которая была использована для проверки размещения корабля
  private _oldCell: Cell | null = null;
  private cellCreator: CellCreatorService;

  constructor(cellCreator: CellCreatorService, cells?: CellsMatrix) {
    super(cells)
    this.shipValidation = new ShipPlaceValidationService(this.cells);
    this.cellCreator = cellCreator;
  }

  /**
   * Размещение корабля в клетке с проверкой возможности размещения.
   * При успешном размещении - true, при неудаче - false;
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

  /**
   * Удаление корабля из клеток.
   */
  public removeShipFromCell(cellData: ColRowData, ship: Ship): void {
    const cell = this.cellCreator.create(cellData);
    if (!ship || !cell) return;

    for (let i = 0; i < ship.shipData.size; i++) {
      const newCellData = getNewCellData(cell.cellData, ship.shipData.position, i);
      this.removeShip(this.cellCreator.create(newCellData));
    }
  }

  /**
   * Отображение возможных для размещения корабля клеток, либо отображение невозможности размещения.
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

  /**
   * Очистка клеток, которые были помечены как возможные для размещения клеток.
   */
  public removeAllowedCells(ship: Ship): void {
    if (!this._oldCell) return;

    for (let i = 0; i < ship.shipData.size; i++) {
      const newCellData: ColRowData = getNewCellData(this._oldCell.cellData, ship.shipData.position, i);
      this.cellCreator.create(newCellData)?.removeShipAllowed();
    }
  }

  /*
   * Размещение кораблей на поле из матрицы клеток.
   */
  public placeShipsFromCells(battlefieldData: BattlefieldData): void {
    const { cells, ships } = battlefieldData;
    if (!cells || !ships) return;
    this.clearCells();

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

  /**
   * Размещение корабля в клетках.
   */
  private placeToCells(cell: Cell | null, ship: Ship | null): void {
    if (!cell || !ship) return;
    cell.appendShip(ship);

    for (let i = 0; i < ship.shipData.size; i++) {
      const newCellData: ColRowData = getNewCellData(cell.cellData, ship.shipData.position, i);
      this.placeShip(this.cellCreator.create(newCellData), ship);
    }
  }

  /**
   * Установка наличия кораблей в клетке.
   */
  private placeShip(cell: Cell | null, ship: Ship): void {
    if (!cell || !ship) return;
    cell.setCellClassShip();
    this.setShipIdInCell(cell.cellData, ship.shipData.id)
  }

  /**
   * Удаление корабля из клетки
   */
  private removeShip(cell: Cell | null): void {
    if (!cell) return;
    this.setShipIdInCell(cell.cellData, null);
    cell.setCellClassEmpty();
  }

  /**
   * Отображение клеток, в которых можно разместить корабли.
   */
  private setAllowedCells(cell: Cell, ship: Ship): void {
    this._oldCell = cell;

    for (let i = 0; i < ship.shipData.size; i++) {
      const newCellData: ColRowData = getNewCellData(cell.cellData, ship.shipData.position, i);
      this.cellCreator.create(newCellData)?.setShipAllowed();
    }
  }
}