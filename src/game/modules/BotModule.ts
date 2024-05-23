import {ShipData} from "@/game/interfaces/ShipData";
import {compareNum, equalColRowData, getEmptyCells, getRandomInt, getStartCellShip} from "@/game/modules/Functions";
import {ColRowData} from "@/game/interfaces/ColRowData";
import {HitData} from "@/game/interfaces/HitData";
import {HitStatus} from "@/game/enums/HitStatus";
import {DifficultyLevel} from "@/game/enums/DifficultyLevel";
import {CellsMatrix} from "@/game/interfaces/CellsMatrix";

export default class BotModule {

    //Клетки игрока для заполнения в процессе (изначально пустые)
    private _userCells: CellsMatrix;
    //Клетки и корабли бота
    private _botCells: CellsMatrix;
    private _botShips: Array<ShipData>;
    private _hitsOnBotShips: Array<number>;
    private historyHitCells: Array<{ col: number, row: number, hit: HitStatus }> = [];
    private difficultyLevel: DifficultyLevel = DifficultyLevel.Easy;

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
            return this.getRandomCellForShipHit(firstHitCell);
        }

        const lastHitCell = this.historyHitCells[historyLength - 1];
        const penultHitCell = this.historyHitCells[historyLength - 2];

        if (lastHitCell.hit === HitStatus.Hit) {
            const newHitCell = this.getNearbyCell(lastHitCell, firstHitCell);
            if (!this.checkCellIsHit(newHitCell)) {
                this.setCellIsHit(newHitCell);
                return newHitCell;
            }
        }

        if (penultHitCell.hit === HitStatus.Hit && !equalColRowData(firstHitCell, penultHitCell)) {
            const newHitCell = this.getNearbyCell(firstHitCell, penultHitCell);
            if (!this.checkCellIsHit(newHitCell)) {
                this.setCellIsHit(newHitCell);
                return newHitCell;
            }
        }

        return this.getRandomCellForShipHit(firstHitCell);
    }

    private getNearbyCell(cell1: ColRowData, cell2: ColRowData): ColRowData {
        return {
            col: cell1.col + compareNum(cell1.col, cell2.col),
            row: cell1.row + compareNum(cell1.row, cell2.row)
        };
    }

    private getRandomCellForShipHit(cellData: ColRowData) {
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
    private shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private getRandomCell() {
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

    private setCellIsHit(cellData: ColRowData) {
        this._userCells[cellData.row][cellData.col] = 1;
    }

    /*
    Сообщить боту результат его попадания.
     */
    public setHitData(cellData: ColRowData, hitData: HitData): void {
        if (hitData.hit === HitStatus.Hit ||
            (hitData.hit === HitStatus.Miss && this.historyHitCells.length !== 0)) {
            this.historyHitCells.push({...cellData, hit: hitData.hit});
        }
        else if (hitData.hit === HitStatus.Destroyed) {
            this.historyHitCells.length = 0;

            if (hitData.emptyCells) {
                for (const cell of hitData.emptyCells) {
                    this.setCellIsHit(cell);
                }
            }
        }
    }

    public hitOnBotCell(cellData: ColRowData) {
        const shipId = this.getShipInBotCell(cellData)
        if (shipId) {
            const shipData = this._botShips.find(ship => ship.id === shipId);
           if(shipData){
               this._hitsOnBotShips[shipId]++;
               let startCellData = null;
               if (this._hitsOnBotShips[shipId] === shipData.size) {
                   startCellData = getStartCellShip(this._botCells, shipId);
               }
               return {
                   shipData: shipData,
                   startCellData: startCellData,
               };
           }
        }
        return {
            shipData: null,
            startCellData: null
        };
    }

    private getShipInBotCell(cellData: ColRowData) {
        return this._botCells[cellData.row][cellData.col];
    }

}