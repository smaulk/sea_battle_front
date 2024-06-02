import { ColRowData } from "@/interfaces/ColRowData.ts";
import { config } from "@/config.ts";
import { ShipData } from "@/interfaces/ShipData.ts";
import { Position } from "@/enums/Position.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";

/**
 * Получить объект типа {col, row} из HTML элемента клетки
 * @param elem HTML элемент клетки
 */
function getColRowData(elem: HTMLDivElement): ColRowData | null {
  const dataset = Object.keys(elem.dataset);
  return dataset.includes('col') && dataset.includes('row')
    ? {
      col: parseInt(elem.dataset.col as string),
      row: parseInt(elem.dataset.row as string)
    }
    : null;
}

/**
 * Проверка равенства двух клеток типа {col, row}
 */
function equalColRowData(data1: ColRowData, data2: ColRowData): boolean {
  return data1.row === data2.row && data1.col === data2.col;
}

/**
 * Получить матрицу, заполненную указанным значением
 */
function getFilledCellsMatrix<T>(value: T): T[][] {
  const count = config.countCells;
  const cells: T[][] = [];
  for (let i = 0; i < count; i++) {
    cells.push(Array(count).fill(value));
  }
  return cells;
}

/**
 * Получить случайное число типа int
 */
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function getRandomColRowData(): ColRowData {
  const max = config.countCells;
  return {
    col: getRandomInt(max),
    row: getRandomInt(max)
  }
}

/**
 * Сравнение чисел
 * 0 - если равны, 1 если num1 > num2, -1 если num1 < num2
 */
function compareNum(num1: number, num2: number): 0 | 1 | -1 {
  return (num1 === num2) ? 0
    : (num1 > num2 ? 1 : -1);
}

/**
 * Проверка, что индекс клетки правильный.
 */
function isValidIndex(index: number): boolean {
  return index >= 0 && index < config.countCells;
}

/**
 * Проверка, что индекс клетки правильный.
 */
function isValidColRowData(cellData: ColRowData): boolean {
  return isValidIndex(cellData.row) && isValidIndex(cellData.col);
}

/**
 * Получить массив клеток, расположенных вокруг данной клетки.
 */
function getAroundCells(cellData: ColRowData): Array<ColRowData> {
  const cells: Array<ColRowData> = []

  const checkCellsAround = ([rowOffset, colOffset]: Array<number>): boolean => {
    const newCellData: ColRowData = {
      col: cellData.col + colOffset,
      row: cellData.row + rowOffset
    }
    if (isValidColRowData(newCellData)) cells.push(newCellData);

    return true;
  }

  const cellsAround: number[][] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  cellsAround.every(checkCellsAround);

  return cells;
}

/**
 * Получить массив клеток, на которых расположен корабль.
 * @param startCellData Первая клетка корабля
 * @param shipData Данные корабля
 */
function getShipCells(startCellData: ColRowData, shipData: ShipData): Array<ColRowData> {
  const shipCells: Array<ColRowData> = [];

  for (let i = 0; i < shipData.size; i++) {
    const newCellData: ColRowData = getNewCellData(startCellData, shipData.position, i);
    shipCells.push(newCellData);
  }

  return shipCells;
}


/**
 * Получить массив пустых клеток вокруг корабля, не включающий клетки самого корабля.
 */
function getShipEmptyCells(startCellData: ColRowData, shipData: ShipData): Array<ColRowData> {
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
 * Получить следующую клетку, в зависимости от расположения корабля.
 * @param cellData Данные клетки
 * @param position Позиция корабля
 * @param offset На сколько изменить координату
 */
function getNewCellData(cellData: ColRowData, position: Position, offset: number): ColRowData {
  return {
    col: position === Position.Horizontal ? cellData.col + offset : cellData.col,
    row: position === Position.Vertical ? cellData.row + offset : cellData.row,
  };
}

/**
 * Получить первую клетку, на которой расположен корабль.
 */
function getStartCellShip(cells: CellsMatrix, shipId: number): ColRowData | null {
  for (let row: number = 0; row < cells.length; row++) {
    const col: number = cells[row].indexOf(shipId);
    if (col !== -1) {
      return { row, col };
    }
  }
  return null;
}

export {
  getColRowData,
  equalColRowData,
  getFilledCellsMatrix,
  getRandomInt,
  getRandomColRowData,
  compareNum,
  isValidIndex,
  isValidColRowData,
  getAroundCells,
  getShipCells,
  getShipEmptyCells,
  getStartCellShip,
  getNewCellData,
}