import { ShipData } from "../interfaces/ShipData.ts";
import {
  getEmptyCells,
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
import { CellsMatrix } from "../interfaces/CellsMatrix.ts";

/**
 * Модуль, отвечающий за отображение ходов пользователю на странице.
 */
export default class GameService {
  //Нажатые пользователем клетки на поле противника (изначально пустые)
  private readonly _rivalClickedCells: CellsMatrix;
  //Поля для игры (html)
  private battlefieldSelf: HTMLDivElement;
  private battlefieldRival: HTMLDivElement;
  //Создание клеток (html)
  private selfCellCreator: CellCreator;
  private rivalCellCreator: CellCreator;

  //Клетки, которые были последними нажаты на полях противника и пользователя
  private lastClickedCellsRival: ColRowData | null = null;
  private lastClickedCellsSelf: ColRowData | null = null;

  private rivalShipsCounter: ShipsCounter;

  constructor(rivalShipsCounter: ShipsCounter,
              rivalCellCreator: CellCreator, selfCellCreator: CellCreator,
              battlefieldSelf: HTMLDivElement, battlefieldRival: HTMLDivElement) {


    this._rivalClickedCells = getEmptyCells();

    this.rivalCellCreator = rivalCellCreator;
    this.selfCellCreator = selfCellCreator;

    this.battlefieldSelf = battlefieldSelf;
    this.battlefieldRival = battlefieldRival;

    this.rivalShipsCounter = rivalShipsCounter;
  }

  /**
   * Выстрел по полю противника.
   */
  public hitOnRivalCell(cellData: ColRowData, shotData: ShotData): void {
    const cell: Cell | null = this.rivalCellCreator.create(cellData);
    if (!cell) return;
    this.setLastClickedCellRival(cell);

    //Если не попал в корабль
    if (shotData.shot === ShotStatus.Miss) {
      this.setClickedCell(cellData);
      cell.setCellClassMiss();
      this.setWaitRival();
    }
    //Если попал в корабль
    else {
      if (!shotData.ship) return;
      this.setClickedCell(cellData, shotData.ship.id);
      //Если корабль уничтожен
      if (shotData.shot === ShotStatus.Destroyed && shotData.startCell) {
        const startCell = this.rivalCellCreator.create(shotData.startCell);
        if (startCell) {
          startCell.appendShip(Ship.create(shotData.ship, true));
          this.setRivalShipDestroyed(shotData.startCell, shotData.ship);
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
    const cell = this.selfCellCreator.create(cellData);
    if (!cell) return;
    this.setLastClickedCellSelf(cell);

    if(shotData.shot === ShotStatus.Miss){
      cell.setCellClassMiss();
      this.setWaitSelf();
    }
    else if(shotData.shot === ShotStatus.Hit){
      cell.setCellClassHit();
    }
    else if(shotData.startCell && shotData.ship){
      this.setSelfShipDestroyed(shotData.startCell, shotData.ship);
    }
  }


  /**
   * Установить клетку в качестве последней нажатой на поле противника.
   */
  private setLastClickedCellRival(cell: Cell | null): void {
    if (!cell) return;
    if (this.lastClickedCellsRival) {
      const oldCell = this.rivalCellCreator.create(this.lastClickedCellsRival);
      if (oldCell) oldCell.removeCellClassLast();
    }

    this.lastClickedCellsRival = cell.cellData;
    cell.setCellClassLast()
  }

  /**
   * Установить клетку в качестве последней нажатой на поле игрока.
   */
  private setLastClickedCellSelf(cell: Cell): void {
    if (!cell) return;
    if (this.lastClickedCellsSelf) {
      const oldCell = this.selfCellCreator.create(this.lastClickedCellsSelf);
      if (oldCell) oldCell.removeCellClassLast();
    }
    this.lastClickedCellsSelf = cell.cellData;
    cell.setCellClassLast();
  }

  /**
   * Заблокировать поле противника.
   */
  private setWaitRival(): void {
    this.battlefieldSelf.classList.remove('battlefield__wait');
    this.battlefieldRival.classList.add('battlefield__wait');
  }

  /**
   * Заблокировать поле игрока.
   */
  private setWaitSelf(): void {
    this.battlefieldRival.classList.remove('battlefield__wait');
    this.battlefieldSelf.classList.add('battlefield__wait');
  }

  /**
   * Записать клетку в список нажатых игроком клеток.
   */
  private setClickedCell(cellData: ColRowData, shipId?: number | null): void {
    this._rivalClickedCells[cellData.row][cellData.col] =
      shipId !== null && shipId !== undefined ? shipId : -1;
  }

  /**
   * Проверить, нажата ли кнопка, и есть ли попадание.
   */
  public checkClickedCells(cellData: ColRowData): number | null {
    return this._rivalClickedCells[cellData.row][cellData.col];
  }

  /**
   * Отобразить уничтоженный корабль противника.
   */
  private setRivalShipDestroyed(startCellData: ColRowData, shipData: ShipData): void {
    this.addClassDoneToCellsRival(startCellData, shipData);
    this.addClassMissToCellsRival(startCellData, shipData);
  }

  /**
   * Установить клетки противника в качестве уничтоженных.
   */
  private addClassDoneToCellsRival(startCellData: ColRowData, shipData: ShipData): void {
    const shipCells = getShipCells(startCellData, shipData);
    for (let cellData of shipCells) {
      const cell = this.rivalCellCreator.create(cellData);
      if (cell) cell.setCellClassDestroyed();
    }
  }

  /**
   * Установить клетки противника в качестве промахов.
   */
  private addClassMissToCellsRival(startCellData: ColRowData, shipData: ShipData): void {
    const emptyCells = getShipEmptyCells(startCellData, shipData);
    for (const cellData of emptyCells) {
      const cell = this.rivalCellCreator.create(cellData);
      if (cell) {
        cell.setCellClassMissAuto();
        this.setClickedCell(cellData);
      }
    }
  }

  /**
   * Установить корабль пользователя в качестве уничтоженного.
   */
  private setSelfShipDestroyed(startCellData: ColRowData, shipData: ShipData): void {
    this.addClassDoneToCellsSelf(startCellData, shipData);
    this.addClassMissToCellsSelf(startCellData, shipData);
  }

  /**
   * Установить клетки пользователя в качестве уничтоженных
   */
  private addClassDoneToCellsSelf(startCellData: ColRowData, shipData: ShipData): void {
    const shipCells = getShipCells(startCellData, shipData);
    for (let cellData of shipCells) {
      const cell = this.selfCellCreator.create(cellData);
      if (cell) cell.setCellClassDestroyed();
    }
  }

  /**
   * Установить клетки пользователя в качестве промахов и вернуть массив данных клеток.
   */
  private addClassMissToCellsSelf(startCellData: ColRowData, shipData: ShipData): void {
    const emptyCells = getShipEmptyCells(startCellData, shipData);
    for (let cellData of emptyCells) {
      const cell = this.selfCellCreator.create(cellData);
      if (cell) cell.setCellClassMissAuto();
    }
  }



}