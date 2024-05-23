import {ShipData} from "../interfaces/ShipData";
import {
    equalColRowData,
    getAroundCells,
    getColRowData,
    getEmptyCells,
    getRandomInt,
    getShipCells,
    getStartCellShip
} from "./Functions";
import {ColRowData} from "../interfaces/ColRowData";
import Cell from "../classes/Cell";
import Ship from "../classes/Ship";
import CellCreator from "../classes/CellCreator";
import BotModule from "./BotModule";
import {config} from "@/config";
import {GameStatus} from "../enums/GameStatus";
import {HitData} from "../interfaces/HitData";
import {HitStatus} from "../enums/HitStatus";
import ShipsCounter from "../classes/ShipsCounter";
import {CellsMatrix} from "../interfaces/CellsMatrix";

export default class GameModule {
    //Клетки и корабли игрока
    private _selfCells: CellsMatrix;
    private _selfShips: Array<ShipData>;
    private _hitsOnSelfShips: Array<number>;

    //Нажатые пользователем клетки на поле противника (изначально пустые)
    private _rivalClickedCells: CellsMatrix;
    //Модуль бота
    private botModule: BotModule;
    //Поля для игры (html)
    private battlefieldSelf: HTMLDivElement;
    private battlefieldRival: HTMLDivElement;
    //Создание клеток (html)
    private selfCellCreator: CellCreator;
    private rivalCellCreator: CellCreator;

    private _selfShipsDestroyed: number;

    private isCanClick: boolean;

    private lastClickedCellsRival: ColRowData | null = null;
    private lastClickedCellsSelf: ColRowData | null = null;

    private rivalShipsCounter: ShipsCounter;

    constructor(botModule: BotModule, rivalShipsCounter: ShipsCounter,
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

    /*
    Установить клетку в качестве последней нажатой на поле противника.
     */
    private setLastClickedCellRival(cell: Cell | null) {
        if(!cell) return;
        if (this.lastClickedCellsRival) {
            const oldCell = this.rivalCellCreator.create(this.lastClickedCellsRival);
            if (oldCell) oldCell.removeCellClassLast();
        }

        this.lastClickedCellsRival = cell.cellData;
        cell.setCellClassLast()
    }

    /*
    Установить клетку в качестве последней нажатой на поле игрока.
     */
    private setLastClickedCellSelf(cell: Cell) {
        if (!cell) return;
        if (this.lastClickedCellsSelf) {
            const oldCell = this.selfCellCreator.create(this.lastClickedCellsSelf);
            if(oldCell) oldCell.removeCellClassLast();
        }
        this.lastClickedCellsSelf = cell.cellData;
        cell.setCellClassLast();
    }

    /*
        Выстрел по полю противника.
     */
    public hitOnRivalCell(cellElement: HTMLDivElement): boolean {
        //Проверка, если клетка не существует
        const cellData = getColRowData(cellElement);
        if (!cellData) return true;
        //Проверка, если пользователь кликал на клетку
        const clickedCell = this.checkClickedCells(cellData);
        if (clickedCell) return true;


        const cell: Cell | null = this.rivalCellCreator.create(cellData);
        if(!cell) return false;
        this.setLastClickedCellRival(cell);
        //Получаю от соперника(бота) данные корабля и стартовой клетки корабля (если их нет то null)
        const {shipData, startCellData} = this.botModule.hitOnBotCell(cellData);
        //Если попал в корабль
        if (shipData) {

            this.setClickedCell(cellData, shipData.id);
            //Если корабль уничтожен
            if (startCellData) {
                const startCell = this.rivalCellCreator.create(startCellData);
                if(startCell) {
                    startCell.appendShip(Ship.create(shipData, true));
                    this.setRivalShipDestroyed(startCellData, shipData);
                    this.rivalShipsCounter.incrementPlaced();
                    this.rivalShipsCounter.decrementRemaining(shipData.size);
                }
            }
            else //Если не убил корабль
            {
                cell.setCellClassHit();
            }

            return true;
        } else //Если не попал по кораблю
        {
            this.setClickedCell(cellData);
            cell.setCellClassMiss();
        }

        this.setWaitRival();

        return false;
    }

    /*
        Заблокировать поле противника.
     */
    private setWaitRival() {
        this.battlefieldSelf.classList.remove('battlefield__wait');
        this.battlefieldRival.classList.add('battlefield__wait');
    }

    /*
        Заблокировать поле игрока.
     */
    private setWaitSelf() {
        this.battlefieldRival.classList.remove('battlefield__wait');
        this.battlefieldSelf.classList.add('battlefield__wait');
    }


    /*
        Записать клетку в список нажатых игроком клеток.
     */
    private setClickedCell(cellData: ColRowData, shipId?: number | null) {
        this._rivalClickedCells[cellData.row][cellData.col] =
            shipId !== null && shipId !== undefined ? shipId : -1;
    }

    /*
        Проверить, нажата ли кнопка, и есть ли попадание.
     */

    private checkClickedCells(cellData: ColRowData) {
        return this._rivalClickedCells[cellData.row][cellData.col];
    }


    private setRivalShipDestroyed(startCellData: ColRowData, shipData: ShipData) {
        this.addClassDoneToCellsRival(startCellData, shipData);
        this.addClassMissToCellsRival(startCellData, shipData);
    }

    private addClassDoneToCellsRival(startCellData: ColRowData, shipData: ShipData) {
        const shipCells = getShipCells(startCellData, shipData);
        for (let cellData of shipCells) {
            const cell = this.rivalCellCreator.create(cellData);
            if(cell) cell.setCellClassDestroyed();
        }
    }


    private addClassMissToCellsRival(startCellData: ColRowData, shipData: ShipData) {
        const emptyCells = this.getShipEmptyCellsFiltered(startCellData, shipData);
        for (let cellData of emptyCells) {
            const cell = this.rivalCellCreator.create(cellData);
            if(cell){
                cell.setCellClassMissAuto();
                this.setClickedCell(cellData);
            }
        }
    }


    private setSelfShipDestroyed(startCellData: ColRowData, shipData: ShipData) {
        this.addClassDoneToCellsSelf(startCellData, shipData);
        return this.addClassMissToCellsSelf(startCellData, shipData);
    }

    private addClassDoneToCellsSelf(startCellData: ColRowData, shipData: ShipData) {
        const shipCells = getShipCells(startCellData, shipData);
        for (let cellData of shipCells) {
            const cell = this.selfCellCreator.create(cellData);
            if(cell) cell.setCellClassDestroyed();
        }
    }


    private addClassMissToCellsSelf(startCellData: ColRowData, shipData: ShipData) {
        const emptyCells = this.getShipEmptyCellsFiltered(startCellData, shipData);
        for (let cellData of emptyCells) {
            const cell = this.selfCellCreator.create(cellData);
            if (cell) cell.setCellClassMissAuto();
        }
        return emptyCells;
    }


    private getShipInSelfCell(cellData: ColRowData) {
        return this._selfCells[cellData.row][cellData.col];
    }

    public hitOnSelfCell(cellData: ColRowData): HitData | null {
        const cell = this.selfCellCreator.create(cellData);
        if (!cell) return null;
        this.setLastClickedCellSelf(cell);
        const shipId = this.getShipInSelfCell(cellData);

        if (shipId) {
            const shipData = this._selfShips.find(ship => ship.id === shipId);
            if(shipData){
                this._hitsOnSelfShips[shipId]++;
                //Если корабль уничтожен
                if (this._hitsOnSelfShips[shipId] === shipData.size) {
                    const startCellData = getStartCellShip(this._selfCells, shipId);
                    if(startCellData){
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


    private getShipEmptyCellsFiltered(startCellData: ColRowData, shipData: ShipData): Array<ColRowData> {
        let filteredCells: Array<ColRowData> = [];
        const shipCells = getShipCells(startCellData, shipData);

        const isUnique = (cellData: ColRowData) => {
            return !filteredCells.some(cell => equalColRowData(cell, cellData));
        }

        for (let shipCell of shipCells) {
            const emptyCells = getAroundCells(shipCell);
            for (let cell of emptyCells) {
                if (isUnique(cell)) filteredCells.push(cell)
            }
        }
        for (let shipCell of shipCells) {
            filteredCells = filteredCells.filter(cellData => !equalColRowData(cellData, shipCell));
        }

        return filteredCells;
    }


    /*
    Игровой переключатель.
    Ожидает ходы пользователя и запускает ходы бота.
     */
    public async gameHandler(event: Event): Promise<GameStatus | null> {
        if (!this.isCanClick) return null;

        const isSelfHit = this.hitOnRivalCell(event.target as HTMLDivElement);
        if (isSelfHit) {
            return this.checkDestroyedShips();
        }

        const botHit = async (): Promise<GameStatus> => {
            return new Promise((resolve) => {
                this.isCanClick = false;

                setTimeout(async () => {
                    const cellData: ColRowData | null = this.botModule.getCellToHit();
                    if(!cellData) return;
                    const hitData: HitData | null = this.hitOnSelfCell(cellData);
                    if (!hitData) return;

                    this.botModule.setHitData(cellData, hitData);
                    if (hitData.hit) {
                        const gameInfo = this.checkDestroyedShips();
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


    private checkDestroyedShips(): GameStatus {
        if (this.rivalShipsCounter.isAllPlaced()) {
            this.isCanClick = false;
            return GameStatus.UserWin;
        } else if (this._selfShipsDestroyed === this._selfShips.length) {
            this.isCanClick = false;
            return GameStatus.RivalWin;
        }
        return GameStatus.InProgress;
    }
}