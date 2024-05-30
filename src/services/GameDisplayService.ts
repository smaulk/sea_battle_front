import { ShipData } from "../interfaces/ShipData.ts";
import {
  getShipCells,
  getShipEmptyCells,
} from "@/helpers";
import { ColRowData } from "../interfaces/ColRowData.ts";
import Cell from "@/models/Cell.ts";
import Ship from "@/models/Ship.ts";
import CellCreator from "@/helpers/CellCreator.ts";
import { ShotData } from "@/interfaces/ShotData.ts";
import { ShotStatus } from "../enums/ShotStatus.ts";
import ShipsCounter from "@/helpers/ShipsCounter.ts";
import ShotCellsMatrixService from "@/services/ShotCellsMatrixService.ts";

/**
 * Модуль, отвечающий за отображение ходов пользователю на странице.
 */
export default class GameDisplayService {
  private readonly _shotCellService: ShotCellsMatrixService;
  private rivalShipsCounter: ShipsCounter;
  //Поля для игры (html)
  private battlefieldUser: HTMLDivElement;
  private battlefieldRival: HTMLDivElement;
  //Создание клеток (html)
  private readonly userCellCreator: CellCreator;
  private readonly rivalCellCreator: CellCreator;
  //Клетки, которые были последними нажаты на полях противника и пользователя
  private lastClickedCellsRival: ColRowData | null = null;
  private lastClickedCellsUser: ColRowData | null = null;

  constructor(rivalShipsCounter: ShipsCounter,
              rivalCellCreator: CellCreator, selfCellCreator: CellCreator,
              battlefieldSelf: HTMLDivElement, battlefieldRival: HTMLDivElement) {
    this._shotCellService = new ShotCellsMatrixService();
    this.rivalCellCreator = rivalCellCreator;
    this.userCellCreator = selfCellCreator;
    this.battlefieldUser = battlefieldSelf;
    this.battlefieldRival = battlefieldRival;
    this.rivalShipsCounter = rivalShipsCounter;
  }

  /**
   * Отобразить выстрел по полю противника.
   */
  public hitOnRivalCell(cellData: ColRowData, shotData: ShotData): void {
    const cell: Cell | null = this.rivalCellCreator.create(cellData);
    if (!cell) return;
    this._shotCellService.setCellIsShot(cellData);
    this.setLastClickedCell(cell, true);

    //Если не попал в корабль
    if (shotData.shot === ShotStatus.Miss) {
      cell.setCellClassMiss();
      this.setBattlefieldWait(true);
    }
    //Если попал в корабль
    else {
      if (!shotData.ship) return;
      //Если корабль уничтожен
      if (shotData.shot === ShotStatus.Destroyed && shotData.startCell) {
        const startCell = this.rivalCellCreator.create(shotData.startCell);
        if (startCell) {
          startCell.appendShip(Ship.create(shotData.ship, true));
          this.setShipDestroyed(shotData.startCell, shotData.ship, true);
          this.rivalShipsCounter.incrementPlaced();
          this.rivalShipsCounter.decrementRemaining(shotData.ship.size);
        }
      }
      //Если корабль не уничтожен
      else cell.setCellClassHit();
    }
  }

  /**
   * Отобразить выстрел по клетке пользователя.
   */
  public hitOnSelfCell(cellData: ColRowData, shotData: ShotData): void {
    const cell = this.userCellCreator.create(cellData);
    if (!cell) return;
    this.setLastClickedCell(cell, false);

    if(shotData.shot === ShotStatus.Miss){
      cell.setCellClassMiss();
      this.setBattlefieldWait(false);
    }
    else if(shotData.shot === ShotStatus.Hit){
      cell.setCellClassHit();
    }
    else if(shotData.startCell && shotData.ship){
      this.setShipDestroyed(shotData.startCell, shotData.ship, false);
    }
  }

  /**
   * Установить клетку в качестве последней нажатой на поле.
   * @param cell - Клетка, которую надо сделать последней нажатой
   * @param isRival - Флаг, true - поле противника, false - поле игрока
   * @private
   */
  private setLastClickedCell(cell: Cell, isRival: boolean): void {
    if (!cell) return;
    const lastClickedCell: ColRowData | null = isRival ? this.lastClickedCellsRival : this.lastClickedCellsUser;
    const cellCreator: CellCreator = isRival ? this.rivalCellCreator : this.userCellCreator;
    //Удаление прошлой последней клетки
    if (lastClickedCell) {
      cellCreator.create(lastClickedCell)?.removeCellClassLast();
    }
    //Добавление новой последней клетки
    if (isRival) this.lastClickedCellsRival = cell.cellData;
    else this.lastClickedCellsUser = cell.cellData;
    cell.setCellClassLast();
  }

  /**
   * Заблокировать поле
   * @param isRival - Флаг, если true - установить ожидание противнику, false - пользователю
   * @private
   */
  private setBattlefieldWait(isRival: boolean): void {
    (isRival ?  this.battlefieldUser : this.battlefieldRival)
      .classList.remove('battlefield__wait');
    (isRival ? this.battlefieldRival: this.battlefieldUser)
      .classList.add('battlefield__wait');
  }


  /**
   * Отобразить уничтоженный корабль.
   * @param startCellData - Начальная клетка корабля
   * @param shipData - Данные корабля
   * @param isRival - Флаг, если true - отобразить корабль противнику, false - пользователю
   */
  private setShipDestroyed(startCellData: ColRowData, shipData: ShipData, isRival: boolean): void {
    const cellCreator = isRival ? this.rivalCellCreator : this.userCellCreator;
    this.addClassDoneToCells(startCellData, shipData, cellCreator);
    this.addClassMissToCells(startCellData, shipData, cellCreator, isRival);
  }

  /**
   * Установить клетки корабля в качестве уничтоженных.
   */
  private addClassDoneToCells(startCellData: ColRowData, shipData: ShipData, cellCreator: CellCreator): void {
    const shipCells = getShipCells(startCellData, shipData);
    for (const cellData of shipCells) {
      cellCreator.create(cellData)?.setCellClassDestroyed();
    }
  }

  /**
   * Установить клетки вокруг корабля в качестве промахов.
   */
  private addClassMissToCells(startCellData: ColRowData, shipData: ShipData, cellCreator: CellCreator, isRival: boolean): void {
    const emptyCells = getShipEmptyCells(startCellData, shipData);
    for (const cellData of emptyCells) {
      const cell = cellCreator.create(cellData);
      if (cell) {
        cell.setCellClassMissAuto();
        if(isRival) this._shotCellService.setCellIsShot(cellData);
      }
    }
  }

  /** Проверка, что в клетку можно выстрелить. */
  public checkCellIsCanShot(cellData: ColRowData): boolean{
      return this._shotCellService.checkCellIsCanShot(cellData);
  }
}