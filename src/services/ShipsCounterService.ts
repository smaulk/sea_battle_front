import { config } from "@/config.ts";
import { ShipData } from "@/interfaces/ShipData.ts";
import { Position } from "@/enums/Position.ts";
import { reactive } from "vue";

/**
 * Класс, отвечающий за подсчет количества кораблей (размещенных и оставшихся),
 * а также за создание дефолтного массива кораблей.
 */
export default class ShipsCounterService {
  private _countOfRemaining: Record<number, number>;
  private _countOfPlaced: number;
  private readonly countShips: number;
  private readonly shipsOfSize1: number;
  private readonly shipsOfSize2: number;
  private readonly shipsOfSize3: number;
  private readonly shipsOfSize4: number;

  constructor() {
    this.countShips = config.countShips;
    this.shipsOfSize1 = config.countShipsOfSize1;
    this.shipsOfSize2 = config.countShipsOfSize2;
    this.shipsOfSize3 = config.countShipsOfSize3;
    this.shipsOfSize4 = config.countShipsOfSize4;
    this._countOfRemaining = this.getDefaultShipsCount();
    this._countOfPlaced = 0;

  }

  get count(): Object {
    return this._countOfPlaced;
  }

  /** Увеличить количество оставшихся кораблей */
  public incrementRemaining(shipSize: number): void {
    this._countOfRemaining[shipSize]++;
  }

  /** Уменьшить количество оставшихся кораблей */
  public decrementRemaining(shipSize: number): void {
    this._countOfRemaining[shipSize]--;
  }

  /** Увеличить количество размещенных кораблей */
  public incrementPlaced(): void {
    this._countOfPlaced++;
  }

  /** Проверка, что все корабли расставлены*/
  public isAllPlaced(): boolean {
    return this._countOfPlaced === this.countShips;
  }

  /** Получить количество оставшихся кораблей */
  public getRemainingCount(shipSize: number): number {
    return this._countOfRemaining[shipSize];
  }

  /** Установить все корабли в качестве размещенных */
  public setAllPlaced() {
    for (let i = 1; i <= 4; i++) this._countOfRemaining[i] = 0;
    this._countOfPlaced = this.countShips;
  }

  /** Установить все корабли в качестве оставшихся */
  public setAllRemaining() {
    this._countOfRemaining = this.getDefaultShipsCount();
    this._countOfPlaced = 0;
  }

  /**
   * Получить дефолтный массив кораблей.
   */
  public getShipsArray(): Array<ShipData> {
    let ships: Array<ShipData> = [];
    let id: number = 1; // Начальный идентификатор для кораблей

    // Функция для добавления кораблей определенного размера
    const addShips = (size: number, count: number) => {
      for (let i = 0; i < count; i++) {
        let ship: ShipData = { id: id++, size: size, position: Position.Horizontal }
        ships.push(ship);
      }
    }

    // Добавление кораблей каждого размера
    addShips(4, this.shipsOfSize4);
    addShips(3, this.shipsOfSize3);
    addShips(2, this.shipsOfSize2);
    addShips(1, this.shipsOfSize1);

    return ships;
  }

  /** Получение объекта с дефолтным количеством кораблей. */
  private getDefaultShipsCount() {
    return reactive({
      4: this.shipsOfSize4,
      3: this.shipsOfSize3,
      2: this.shipsOfSize2,
      1: this.shipsOfSize1
    });
  }

}