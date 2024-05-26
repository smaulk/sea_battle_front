import {ShipData} from "@/game/interfaces/ShipData";
import {compareNum,  getEmptyCells, getRandomInt, getStartCellShip} from "game/utils";
import {ColRowData} from "@/game/interfaces/ColRowData";
import {BotHitData, HitData} from "game/interfaces/HitData.ts";
import {HitStatus} from "@/game/enums/HitStatus";
import {DifficultyLevel} from "@/game/enums/DifficultyLevel";
import {CellsMatrix} from "@/game/interfaces/CellsMatrix";

/*
    Модуль, отвечающий за игру бота.
 */
export default class BotModule {

    //Клетки игрока для заполнения в процессе (изначально пустые)
    private readonly _userCells: CellsMatrix;
    //Клетки и корабли бота
    private readonly _botCells: CellsMatrix;
    private _botShips: Array<ShipData>;
    //Количество выстрелов по кораблям бота [shipId]
    private readonly _hitsOnBotShips: Array<number>;
    //История попаданий (записывается при первом попадании, при уничтожении очищается)
    private historyHitCells: Array<ColRowData> = [];
    //Уровень сложности бота
    private readonly difficultyLevel: DifficultyLevel = DifficultyLevel.Easy;

    constructor(botCells: CellsMatrix, botShips: Array<ShipData>, difficultyLevel: DifficultyLevel) {
        this._botCells = botCells;
        this._botShips = botShips;
        this._userCells = getEmptyCells();

        this._hitsOnBotShips = [];
        botShips.forEach((ship: ShipData) => {
            this._hitsOnBotShips[ship.id] = 0;
        })

        this.difficultyLevel = difficultyLevel;
    }

    /*
        Возвращает клетку, в которую бот сделал выстрел.
     */
    public getCellToHit(): ColRowData {
        const historyLength = this.historyHitCells.length;
        //Если уровень сложности Нормально и история не пустая
        if (this.difficultyLevel === DifficultyLevel.Normal && historyLength > 0) {
            const firstHitCell: ColRowData = this.historyHitCells[0];
            let newCell: ColRowData | null;
            //Если в истории только 1 запись
            if (historyLength === 1) newCell =  this.getRandomCellForShipHit(firstHitCell);
            else{
                const lastHitCell: ColRowData = this.historyHitCells[historyLength - 1];
                //Получаем следующую по направлении клетку
                newCell = this.checkNewCell(this.getNearbyCell(lastHitCell, firstHitCell)) ||
                    this.checkNewCell(this.getNearbyCell(firstHitCell, lastHitCell));
            }

            if(newCell) return newCell;
        }
        //Возвращаем случайную клетку
        return this.getRandomCell();
    }

    /*
        Проверить новую клетку для хода, и если она подходит, то записать ее в матрицу клеток.
     */
    private checkNewCell (newHitCell: ColRowData): ColRowData | null {
        //Если в клетку можно совершить выстрел
        if (this.checkCellIsCanToHit(newHitCell)) {
            this.setCellIsHit(newHitCell);
            return newHitCell;
        }
        return null;
    }

    /*
        Получить ближайшую клетку
     */
    private getNearbyCell(cell1: ColRowData, cell2: ColRowData): ColRowData {
        return {
            col: cell1.col + compareNum(cell1.col, cell2.col),
            row: cell1.row + compareNum(cell1.row, cell2.row)
        };
    }

    /*
        Получить случайную соседнюю клетку для выстрела.
     */
    private getRandomCellForShipHit(cellData: ColRowData): ColRowData | null {
        // Создаем список соседних клеток
        let neighbors: Array<ColRowData> = [
            {col: cellData.col + 1, row: cellData.row},
            {col: cellData.col - 1, row: cellData.row},
            {col: cellData.col, row: cellData.row + 1},
            {col: cellData.col, row: cellData.row - 1}
        ];

        // Перемешиваем список
        neighbors = this.shuffle(neighbors);

        // Проверяем каждую соседнюю клетку и возвращаем первую, которая еще не была атакована
        for (let i = 0; i < neighbors.length; i++) {
            const newCell = this.checkNewCell(neighbors[i]);
            if(newCell) return newCell;
        }
        // Если все соседние клетки были атакованы, возвращаем null
        return null;
    }

    /*
    Функция для перемешивания массива (алгоритм Fisher-Yates)
     */
    private shuffle(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /*
        Получить случайную не отстреленную клетку на поле.
     */
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
        } while (!this.checkCellIsCanToHit(cellData))

        this.setCellIsHit(cellData);


        return cellData;
    }

    /*
        Проверка, что в клетку игрока можно выстрелить. Если нельзя выстрелить - false, иначе - true. 
        Если клетка не существует - false.
     */
    private checkCellIsCanToHit(cellData: ColRowData): boolean {
        return (cellData.col < 0 || cellData.row < 0 || cellData.col >= this._userCells.length
            || cellData.row >= this._userCells.length) ? false
            : this._userCells[cellData.row][cellData.col] === null;
    }

    /*
        Записать, что в клетку игрока был совершен выстрел.
     */
    private setCellIsHit(cellData: ColRowData): void {
        this._userCells[cellData.row][cellData.col] = 1;
    }

    /*
        Сообщить боту результат его выстрела по клетке.
     */
    public setBotHitData(cellData: ColRowData, RivalHitData: BotHitData): void {
        //Если попадание
        if (RivalHitData.hit === HitStatus.Hit ) {
            this.historyHitCells.push(cellData);
        }
        //Если корабль уничтожен
        else if (RivalHitData.hit === HitStatus.Destroyed) {
            //Обнуляем историю, и если есть пустые клетки вокруг корабля, записываем их в матрицу
            this.historyHitCells.length = 0;
            if (RivalHitData.emptyCells) {
                RivalHitData.emptyCells.forEach(cell => this.setCellIsHit(cell));
            }
        }
    }

    /*
        Выстрел по клетке бота.
     */
    public hitOnBotCell(cellData: ColRowData): HitData {
        const shipId: number | null = this.getShipInBotCell(cellData)
        if (shipId) {
            const shipData = this._botShips.find(ship => ship.id === shipId);
            if (shipData) {
                this._hitsOnBotShips[shipId]++;
                let startCellData = null;
                let hit = HitStatus.Hit;
                //Если корабль уничтожен (количество попадание равно размеру корабля)
                if (this._hitsOnBotShips[shipId] === shipData.size) {
                    startCellData = getStartCellShip(this._botCells, shipId);
                    hit = HitStatus.Destroyed;
                }
                //Возвращаем промах или уничтожение
                return {
                    hit: hit,
                    ship: shipData,
                    startCell: startCellData,
                };
            }
        }
        //Возвращаем промах
        return {
            hit: HitStatus.Miss,
            ship: null,
            startCell: null
        };
    }

    /*
        Получить id корабля в клетке бота. Либо id корабля, либо null.
     */
    private getShipInBotCell(cellData: ColRowData): number | null {
        return this._botCells[cellData.row][cellData.col];
    }

}