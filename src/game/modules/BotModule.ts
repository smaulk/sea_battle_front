import {ShipData} from "@/game/interfaces/ShipData";
import {compareNum, equalColRowData, getEmptyCells, getRandomInt, getStartCellShip} from "@/game/modules/Functions";
import {ColRowData} from "@/game/interfaces/ColRowData";
import {BotHitData, HitData} from "game/interfaces/HitData.ts";
import {HitStatus} from "@/game/enums/HitStatus";
import {DifficultyLevel} from "@/game/enums/DifficultyLevel";
import {CellsMatrix} from "@/game/interfaces/CellsMatrix";

export default class BotModule {

    //Клетки игрока для заполнения в процессе (изначально пустые)
    private readonly _userCells: CellsMatrix;
    //Клетки и корабли бота
    private readonly _botCells: CellsMatrix;
    private _botShips: Array<ShipData>;
    private readonly _hitsOnBotShips: Array<number>;
    private historyHitCells: Array<{ cell: ColRowData, hit: HitStatus }> = [];
    private readonly difficultyLevel: DifficultyLevel = DifficultyLevel.Easy;

    constructor(botCells: CellsMatrix, botShips: Array<ShipData>, difficultyLevel: DifficultyLevel) {
        this._botCells = botCells;
        this._botShips = botShips;
        this._userCells = getEmptyCells();

        this._hitsOnBotShips = [];
        for (let ship of botShips) {
            this._hitsOnBotShips[ship.id] = 0;
        }

        this.difficultyLevel = difficultyLevel;
    }

    public getCellToHit(): ColRowData | null {
        const historyLength = this.historyHitCells.length;

        if (this.difficultyLevel === DifficultyLevel.Easy || historyLength === 0) {
            return this.getRandomCell();
        }

        const firstHitCell = this.historyHitCells[0];

        if (historyLength === 1) {
            return this.getRandomCellForShipHit(firstHitCell.cell);
        }

        const lastHitCell = this.historyHitCells[historyLength - 1];
        const penultHitCell = this.historyHitCells[historyLength - 2];

        if (lastHitCell.hit === HitStatus.Hit) {
            const newHitCell = this.getNearbyCell(lastHitCell.cell, firstHitCell.cell);
            if (!this.checkCellIsHit(newHitCell)) {
                this.setCellIsHit(newHitCell);
                return newHitCell;
            }
        }

        if (penultHitCell.hit === HitStatus.Hit && !equalColRowData(firstHitCell.cell, penultHitCell.cell)) {
            const newHitCell = this.getNearbyCell(firstHitCell.cell, penultHitCell.cell);
            if (!this.checkCellIsHit(newHitCell)) {
                this.setCellIsHit(newHitCell);
                return newHitCell;
            }
        }

        return this.getRandomCellForShipHit(firstHitCell.cell);
    }

    private getNearbyCell(cell1: ColRowData, cell2: ColRowData): ColRowData {
        return {
            col: cell1.col + compareNum(cell1.col, cell2.col),
            row: cell1.row + compareNum(cell1.row, cell2.row)
        };
    }

    private getRandomCellForShipHit(cellData: ColRowData): ColRowData | null {
        // Создаем список соседних клеток
        let neighbors = [
            {col: cellData.col + 1, row: cellData.row},
            {col: cellData.col - 1, row: cellData.row},
            {col: cellData.col, row: cellData.row + 1},
            {col: cellData.col, row: cellData.row - 1}
        ];

        // Перемешиваем список
        neighbors = this.shuffle(neighbors);

        // Проверяем каждую соседнюю клетку и возвращаем первую, которая еще не была атакована
        for (let i = 0; i < neighbors.length; i++) {
            if (!this.checkCellIsHit(neighbors[i])) {
                this.setCellIsHit(neighbors[i]);
                return neighbors[i];
            }
        }

        // Если все соседние клетки были атакованы, возвращаем null
        return null;
    }

    // Функция для перемешивания массива (алгоритм Fisher-Yates)
    private shuffle(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private getRandomCell(): ColRowData {
        const size = this._userCells.length;

        const randomCell = (): ColRowData => {
            const col = getRandomInt(size);
            const row = getRandomInt(size);
            return {col, row};
        };

        let cellData: ColRowData;
        do {
            cellData = randomCell();
        } while (this.checkCellIsHit(cellData))

        this.setCellIsHit(cellData);


        return cellData;
    }

    private checkCellIsHit(cellData: ColRowData): boolean {
        return (cellData.col < 0 || cellData.row < 0 || cellData.col >= this._userCells.length
            || cellData.row >= this._userCells.length) ? true
            : this._userCells[cellData.row][cellData.col] !== null;
    }

    private setCellIsHit(cellData: ColRowData): void {
        this._userCells[cellData.row][cellData.col] = 1;
    }

    /*
    Сообщить боту результат его попадания.
     */
    public setRivalHitData(cellData: ColRowData, RivalHitData: BotHitData): void {
        if (RivalHitData.hit === HitStatus.Hit ||
            (RivalHitData.hit === HitStatus.Miss && this.historyHitCells.length !== 0)) {
            this.historyHitCells.push({cell: cellData, hit: RivalHitData.hit});
        } else if (RivalHitData.hit === HitStatus.Destroyed) {
            this.historyHitCells.length = 0;

            if (RivalHitData.emptyCells) {
                for (const cell of RivalHitData.emptyCells) {
                    this.setCellIsHit(cell);
                }
            }
        }
    }

    public hitOnBotCell(cellData: ColRowData): HitData {
        const shipId = this.getShipInBotCell(cellData)
        if (shipId) {
            const shipData = this._botShips.find(ship => ship.id === shipId);
            if (shipData) {
                this._hitsOnBotShips[shipId]++;
                let startCellData = null;
                let hit = HitStatus.Hit;
                if (this._hitsOnBotShips[shipId] === shipData.size) {
                    startCellData = getStartCellShip(this._botCells, shipId);
                    hit = HitStatus.Destroyed;
                }
                return {
                    hit: hit,
                    ship: shipData,
                    startCell: startCellData,
                };
            }
        }
        return {
            hit: HitStatus.Miss,
            ship: null,
            startCell: null
        };
    }

    private getShipInBotCell(cellData: ColRowData): number | null {
        return this._botCells[cellData.row][cellData.col];
    }

}