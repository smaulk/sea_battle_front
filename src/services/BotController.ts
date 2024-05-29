import { compareNum, getEmptyCells, getRandomInt, getShipEmptyCells } from "@/helpers";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import { ShotData } from "@/interfaces/ShotData.ts";
import { ShotStatus } from "@/enums/ShotStatus.ts";
import { DifficultyLevel } from "@/enums/DifficultyLevel.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";
import ShotController from "@/services/ShotController.ts";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";

/**
 * Модуль, отвечающий за игру бота.
 */
export default class BotController extends ShotController{
  //Клетки игрока для заполнения в процессе (изначально пустые)
  private readonly _userCells: CellsMatrix;
  //История попаданий (записывается при первом попадании, при уничтожении очищается)
  private historyHitCells: Array<ColRowData> = [];
  //Уровень сложности бота
  private readonly difficultyLevel: DifficultyLevel = DifficultyLevel.Easy;

  constructor(battlefieldData: BattlefieldData, difficultyLevel: DifficultyLevel) {
    super(battlefieldData);
    this._userCells = getEmptyCells();
    this.difficultyLevel = difficultyLevel;
  }

  /**
   * Возвращает клетку, в которую бот сделал выстрел.
   */
  public getCellToShot(): ColRowData {
    const historyLength = this.historyHitCells.length;
    //Если уровень сложности Нормально и история не пустая
    if (this.difficultyLevel === DifficultyLevel.Normal && historyLength > 0) {
      const firstHitCell: ColRowData = this.historyHitCells[0];
      let newCell: ColRowData | null;
      //Если в истории только 1 запись
      if (historyLength === 1) newCell = this.getRandomCellForShipHit(firstHitCell);
      else {
        const lastHitCell: ColRowData = this.historyHitCells[historyLength - 1];
        //Получаем следующую по направлении клетку
        newCell = this.checkNewCell(this.getNearbyCell(lastHitCell, firstHitCell)) ||
          this.checkNewCell(this.getNearbyCell(firstHitCell, lastHitCell));
      }

      if (newCell) return newCell;
    }
    //Возвращаем случайную клетку
    return this.getRandomCell();
  }

  /**
   * Сообщить боту результат его выстрела по клетке.
   */
  public setBotShotData(cellData: ColRowData, shotData: ShotData): void {
    //Если попадание
    if (shotData.shot === ShotStatus.Hit) {
      this.historyHitCells.push(cellData);
    }
    //Если корабль уничтожен
    else if (shotData.shot === ShotStatus.Destroyed) {
      //Обнуляем историю, и если есть пустые клетки вокруг корабля, записываем их в матрицу
      this.historyHitCells.length = 0;
      if(shotData.startCell && shotData.ship){
        const emptyCells = getShipEmptyCells(shotData.startCell, shotData.ship);
        emptyCells.forEach(cell => this.setCellIsHit(cell));
      }
    }
  }

  /**
   * Проверить новую клетку для хода, и если она подходит, то записать ее в матрицу клеток.
   */
  private checkNewCell(newHitCell: ColRowData): ColRowData | null {
    //Если в клетку можно совершить выстрел
    if (this.checkCellIsCanToHit(newHitCell)) {
      this.setCellIsHit(newHitCell);
      return newHitCell;
    }
    return null;
  }

  /**
   * Получить ближайшую клетку
   */
  private getNearbyCell(cell1: ColRowData, cell2: ColRowData): ColRowData {
    return {
      col: cell1.col + compareNum(cell1.col, cell2.col),
      row: cell1.row + compareNum(cell1.row, cell2.row)
    };
  }

  /**
   * Получить случайную соседнюю клетку для выстрела.
   */
  private getRandomCellForShipHit(cellData: ColRowData): ColRowData | null {
    // Создаем список соседних клеток
    let neighbors: Array<ColRowData> = [
      { col: cellData.col + 1, row: cellData.row },
      { col: cellData.col - 1, row: cellData.row },
      { col: cellData.col, row: cellData.row + 1 },
      { col: cellData.col, row: cellData.row - 1 }
    ];

    // Перемешиваем список
    neighbors = this.shuffle(neighbors);

    // Проверяем каждую соседнюю клетку и возвращаем первую, которая еще не была атакована
    for (let i = 0; i < neighbors.length; i++) {
      const newCell = this.checkNewCell(neighbors[i]);
      if (newCell) return newCell;
    }
    // Если все соседние клетки были атакованы, возвращаем null
    return null;
  }

  /**
   * Функция для перемешивания массива (алгоритм Fisher-Yates)
   */
  private shuffle(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Получить случайную не отстреленную клетку на поле.
   */
  private getRandomCell(): ColRowData {
    const size = this._userCells.length;

    const randomCell = (): ColRowData => {
      const col = getRandomInt(size);
      const row = getRandomInt(size);
      return { col, row };
    };

    let cellData: ColRowData;
    do {
      cellData = randomCell();
    } while (!this.checkCellIsCanToHit(cellData))

    this.setCellIsHit(cellData);


    return cellData;
  }

  /**
   * Проверка, что в клетку игрока можно выстрелить. Если нельзя выстрелить - false, иначе - true.
   *   Если клетка не существует - false.
   */
  private checkCellIsCanToHit(cellData: ColRowData): boolean {
    return (cellData.col < 0 || cellData.row < 0 || cellData.col >= this._userCells.length
      || cellData.row >= this._userCells.length) ? false
      : this._userCells[cellData.row][cellData.col] === null;
  }

  /**
   * Записать, что в клетку игрока был совершен выстрел.
   */
  private setCellIsHit(cellData: ColRowData): void {
    this._userCells[cellData.row][cellData.col] = 1;
  }

}