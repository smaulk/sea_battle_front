import { ShipData } from "../interfaces/ShipData.ts";
import {
    equalColRowData,
    getAroundCells,
    getColRowData,
    getEmptyCells,
    getRandomInt,
    getShipCells,
    getStartCellShip
} from "@/helpers";
import { ColRowData } from "../interfaces/ColRowData.ts";
import Cell from "@/models/Cell.ts";
import Ship from "@/models/Ship.ts";
import CellCreator from "@/helpers/CellCreator.ts";
import BotService from "./BotService.ts";
import { config } from "@/config.ts";
import { GameStatus } from "../enums/GameStatus.ts";
import { BotHitData, HitData } from "../interfaces/HitData.ts";
import { HitStatus } from "../enums/HitStatus.ts";
import ShipsCounter from "@/helpers/ShipsCounter.ts";
import { CellsMatrix } from "../interfaces/CellsMatrix.ts";

/**
 * Модуль, отвечающий за игровую логику, взаимодействие с пользователем и ботом.

 * Главный модуль, работающий с остальными модулями.
 */
export default class GameService {
  //Клетки и корабли игрока
  private readonly _selfCells: CellsMatrix;
  private _selfShips: Array<ShipData>;
  private readonly _hitsOnSelfShips: Array<number>;

  //Нажатые пользователем клетки на поле противника (изначально пустые)
  private readonly _rivalClickedCells: CellsMatrix;
  //Модуль бота
  private botModule: BotService;
  //Поля для игры (html)
  private battlefieldSelf: HTMLDivElement;
  private battlefieldRival: HTMLDivElement;
  //Создание клеток (html)
  private selfCellCreator: CellCreator;
  private rivalCellCreator: CellCreator;
  //Количество уничтоженных кораблей пользователя
  private _selfShipsDestroyed: number;
  //Флаг, для проверки, может ли нажимать на клетку пользователь
  private isCanClick: boolean;
  //Клетки, которые были последними нажаты на полях противника и пользователя
  private lastClickedCellsRival: ColRowData | null = null;
  private lastClickedCellsSelf: ColRowData | null = null;

  private rivalShipsCounter: ShipsCounter;

  constructor(botModule: BotService, rivalShipsCounter: ShipsCounter,
              selfCells: CellsMatrix, selfShips: Array<ShipData>,
              rivalCellCreator: CellCreator, selfCellCreator: CellCreator,
              battlefieldSelf: HTMLDivElement, battlefieldRival: HTMLDivElement) {
    this._selfCells = selfCells;
    this._selfShips = selfShips;

    this._rivalClickedCells = getEmptyCells();

    this.rivalCellCreator = rivalCellCreator;
    this.selfCellCreator = selfCellCreator;

    this.battlefieldSelf = battlefieldSelf;
    this.battlefieldRival = battlefieldRival;

    this.botModule = botModule;

    this._hitsOnSelfShips = [];
    for (let ship of selfShips) {
      this._hitsOnSelfShips[ship.id] = 0;
    }

    this._selfShipsDestroyed = 0;
    this.isCanClick = true;

    this.rivalShipsCounter = rivalShipsCounter;
  }

  /**
   * Выстрел по полю противника.
   */
  public hitOnRivalCell(cellElement: HTMLDivElement): boolean {
    //Проверка, если клетка не существует
    const cellData = getColRowData(cellElement);
    if (!cellData) return true;
    //Проверка, если пользователь кликал на клетку
    const clickedCell = this.checkClickedCells(cellData);
    if (clickedCell) return true;

    const cell: Cell | null = this.rivalCellCreator.create(cellData);
    if (!cell) return false;
    this.setLastClickedCellRival(cell);
    //Получаю от соперника(бота) данные корабля и стартовой клетки корабля (если их нет то null)
    const hitData: HitData = this.botModule.hitOnBotCell(cellData);
    //Если не попал в корабль
    if (hitData.hit === HitStatus.Miss) {
      this.setClickedCell(cellData);
      cell.setCellClassMiss();
    }
    //Если попал в корабль
    else {
      if (!hitData.ship) return false;
      this.setClickedCell(cellData, hitData.ship.id);
      //Если корабль уничтожен
      if (hitData.hit === HitStatus.Destroyed && hitData.startCell) {
        const startCell = this.rivalCellCreator.create(hitData.startCell);
        if (startCell) {
          startCell.appendShip(Ship.create(hitData.ship, true));
          this.setRivalShipDestroyed(hitData.startCell, hitData.ship);
          this.rivalShipsCounter.incrementPlaced();
          this.rivalShipsCounter.decrementRemaining(hitData.ship.size);
        }
      }
      //Если корабль не уничтожен
      else cell.setCellClassHit();

      return true;
    }

    this.setWaitRival();
    return false;
  }

  /**
   * Выстрел по клетке пользователя.
   */
  public hitOnSelfCell(cellData: ColRowData): BotHitData | null {
    const cell = this.selfCellCreator.create(cellData);
    if (!cell) return null;
    this.setLastClickedCellSelf(cell);
    const shipId = this.getShipInSelfCell(cellData);

    if (shipId) {
      const shipData = this._selfShips.find(ship => ship.id === shipId);
      if (shipData) {
        this._hitsOnSelfShips[shipId]++;
        //Если корабль уничтожен
        if (this._hitsOnSelfShips[shipId] === shipData.size) {
          const startCellData = getStartCellShip(this._selfCells, shipId);
          if (startCellData) {
            const emptyCells = this.setSelfShipDestroyed(startCellData, shipData);
            this._selfShipsDestroyed++;

            return {
              hit: HitStatus.Destroyed,
              emptyCells: emptyCells,
            };
          }
        }
        cell.setCellClassHit();

        return {
          hit: HitStatus.Hit,
          emptyCells: null,
        };
      }
    }
    cell.setCellClassMiss();
    this.setWaitSelf();

    return {
      hit: HitStatus.Miss,
      emptyCells: null,
    };
  }

  /**
   * Игровой переключатель.
   * Ожидает ходы пользователя и запускает ходы бота.
   */
  public async gameHandler(event: Event): Promise<GameStatus | null> {
    if (!this.isCanClick) return null;

    const isSelfHit = this.hitOnRivalCell(event.target as HTMLDivElement);
    if (isSelfHit) {
      return this.getGameStatus();
    }

    const botHit = async (): Promise<GameStatus> => {
      return new Promise((resolve) => {
        this.isCanClick = false;
        //Выполнение следующего кода с задержкой
        setTimeout(async () => {
          const cellData: ColRowData = this.botModule.getCellToHit();
          const RivalHitData: BotHitData | null = this.hitOnSelfCell(cellData);
          if (!RivalHitData) return;

          this.botModule.setBotHitData(cellData, RivalHitData);
          if (RivalHitData.hit) {
            const gameInfo = this.getGameStatus();
            if (gameInfo) {
              this.isCanClick = false;
              resolve(gameInfo);
            } else {
              const result = await botHit();
              resolve(result);
            }
          } else {
            this.isCanClick = true;
            resolve(GameStatus.InProgress);
          }
        }, config.minBotWaitTimeMS + getRandomInt(config.maxBotWaitTimeMS - config.minBotWaitTimeMS));
      });
    };

    return await botHit();
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
  private checkClickedCells(cellData: ColRowData): number | null {
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
    const emptyCells = this.getShipEmptyCellsFiltered(startCellData, shipData);
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
  private setSelfShipDestroyed(startCellData: ColRowData, shipData: ShipData): Array<ColRowData> {
    this.addClassDoneToCellsSelf(startCellData, shipData);
    return this.addClassMissToCellsSelf(startCellData, shipData);
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
  private addClassMissToCellsSelf(startCellData: ColRowData, shipData: ShipData): Array<ColRowData> {
    const emptyCells = this.getShipEmptyCellsFiltered(startCellData, shipData);
    for (let cellData of emptyCells) {
      const cell = this.selfCellCreator.create(cellData);
      if (cell) cell.setCellClassMissAuto();
    }
    return emptyCells;
  }

  /**
   * Получить id корабля в данной клетке или null.
   */
  private getShipInSelfCell(cellData: ColRowData): number | null {
    return this._selfCells[cellData.row][cellData.col];
  }

  /**
   * Получить массив пустых клеток вокруг корабля, не включающий клетки самого корабля.
   */
  private getShipEmptyCellsFiltered(startCellData: ColRowData, shipData: ShipData): Array<ColRowData> {
    const shipCells: Array<ColRowData> = getShipCells(startCellData, shipData);
    const emptyCells: Set<ColRowData> = new Set<ColRowData>();

    shipCells.forEach(shipCell => {
      getAroundCells(shipCell).forEach(cell => {
        if (!shipCells.some(shipCell => equalColRowData(cell, shipCell))) {
          emptyCells.add(cell);
        }
      });
    });

    return Array.from(emptyCells);
  }

  /**
   * Получение статуса игры.
   */
  private getGameStatus(): GameStatus {
    //Если все корабли противника уничтожены
    if (this.rivalShipsCounter.isAllPlaced()) {
      this.isCanClick = false;
      return GameStatus.UserWin;
    }
    //Если все корабли пользователя уничтожены.
    else if (this._selfShipsDestroyed === this._selfShips.length) {
      this.isCanClick = false;
      return GameStatus.RivalWin;
    }
    return GameStatus.InProgress;
  }
}