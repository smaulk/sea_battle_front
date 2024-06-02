import { compareNum, getRandomColRowData, getShipEmptyCells } from "@/helpers";
import { ColRowData } from "@/interfaces/ColRowData.ts";
import { ShotData } from "@/interfaces/ShotData.ts";
import { ShotStatus } from "@/enums/ShotStatus.ts";
import { DifficultyLevel } from "@/enums/DifficultyLevel.ts";
import ShotService from "@/services/ShotService.ts";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";
import ShotCellsMatrixService from "@/services/ShotCellsMatrixService.ts";
import RandomCellsService from "@/services/RandomCellsService.ts";
import ShipsCounterService from "@/services/ShipsCounterService.ts";

/**
 * Сервис, отвечающий за игру бота.
 */
export default class BotService extends ShotService {
  private readonly _shotCellService: ShotCellsMatrixService;
  //История попаданий (записывается при первом попадании, при уничтожении очищается)
  private historyHitCells: Array<ColRowData> = [];
  //Уровень сложности бота
  private readonly difficultyLevel: DifficultyLevel = DifficultyLevel.Normal;

  constructor(difficultyLevel: DifficultyLevel) {
    super(
      new RandomCellsService()
        .getRandomBattlefieldData(
          new ShipsCounterService().getShipsArray()
        ) as BattlefieldData
    );
    this._shotCellService = new ShotCellsMatrixService();
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
      if (shotData.startCell && shotData.ship) {
        const emptyCells = getShipEmptyCells(shotData.startCell, shotData.ship);
        emptyCells.forEach(cell => this._shotCellService.setCellIsShot(cell));
      }
    }
  }

  /**
   * Проверить новую клетку для хода, и если она подходит, то записать ее в матрицу клеток.
   */
  private checkNewCell(newHitCell: ColRowData): ColRowData | null {
    //Если в клетку можно совершить выстрел
    if (this._shotCellService.checkCellIsCanShot(newHitCell)) {
      this._shotCellService.setCellIsShot(newHitCell);
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
    // Создаем список соседних клеток и перемешиваем его
    const neighbors: Array<ColRowData> = this.shuffle(
      [
        { col: cellData.col + 1, row: cellData.row },
        { col: cellData.col - 1, row: cellData.row },
        { col: cellData.col, row: cellData.row + 1 },
        { col: cellData.col, row: cellData.row - 1 }
      ]
    );
    // Проверяем каждую соседнюю клетку и возвращаем первую, которая еще не была атакована
    return neighbors.find(neighbor => this.checkNewCell(neighbor)) || null;
  }

  /**
   * Функция для перемешивания массива (алгоритм Fisher-Yates)
   */
  private shuffle<T>(array: T[]): T[] {
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
    let cellData: ColRowData;
    // Получаем случайную клетку, пока не найдем ту, в которую можно стрелять
    do {
      cellData = getRandomColRowData();
    } while (!this._shotCellService.checkCellIsCanShot(cellData))
    // Помечаем клетку как отстреленную
    this._shotCellService.setCellIsShot(cellData);

    return cellData;
  }
}