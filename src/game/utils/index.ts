import {ColRowData} from "../interfaces/ColRowData.ts";
import {config} from "@/config.ts";
import {ShipData} from "../interfaces/ShipData.ts";
import {Position} from "../enums/Position.ts";
import {CellsMatrix} from "../interfaces/CellsMatrix.ts";

function getColRowData(elem: HTMLDivElement): ColRowData | null {
    return Object.keys(elem.dataset).length !== 0
        ? {
            col: parseInt(elem.dataset.col as string),
            row: parseInt(elem.dataset.row as string)
        }
        : null;
}

function equalColRowData(data1: ColRowData, data2: ColRowData): boolean {
    return data1.row === data2.row && data1.col === data2.col;
}

function getEmptyCells(): CellsMatrix {
    const count = config.countCells;
    const cells: CellsMatrix = [];
    for (let i = 0; i < count; i++) {
        cells.push(Array(count).fill(null) as Array<number | null>);
    }
    return cells;
}


function getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
}

//0 - если равны, 1 если num1 > num2, -1 если num1 < num2
function compareNum(num1: number, num2: number): 0 | 1 | -1 {
    return (num1 === num2) ? 0
        : (num1 > num2 ? 1 : -1);
}


function isValidIndex(index: number): boolean {
    return index >= 0 && index < config.countCells;
}

function getAroundCells(cellData: ColRowData): Array<ColRowData> {
    const cells: Array<ColRowData> = []

    const checkCellsAround = ([rowOffset, colOffset]: Array<number>): boolean => {
        if (isValidIndex(cellData.col + colOffset) &&
            isValidIndex(cellData.row + rowOffset)) {
            const newCellData: ColRowData = {
                col: cellData.col + colOffset,
                row: cellData.row + rowOffset
            }
            cells.push(newCellData);

        }
        return true;
    }

    const cellsAround = [
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

function getShipCells(startCellData: ColRowData, shipData: ShipData): Array<ColRowData> {
    const shipCells: Array<ColRowData> = [];

    for (let i = 0; i < shipData.size; i++) {
        const newCellData: ColRowData = getNewCellData(startCellData, shipData.position, i);
        shipCells.push(newCellData);
    }

    return shipCells;
}

function getNewCellData(cellData: ColRowData, position: Position, offset: number): ColRowData {
    return {
        col: position === Position.Horizontal ? cellData.col + offset : cellData.col,
        row: position === Position.Vertical ? cellData.row + offset : cellData.row,
    };
}

function getStartCellShip(cells: CellsMatrix, shipId: number): ColRowData | null {
    for (let row: number = 0; row < cells.length; row++) {
        const col: number = cells[row].indexOf(shipId);
        if (col !== -1) {
            return {row, col};
        }
    }
    return null;
}

export {
    getColRowData,
    equalColRowData,
    getEmptyCells,
    getRandomInt,
    compareNum,
    isValidIndex,
    getAroundCells,
    getShipCells,
    getStartCellShip,
    getNewCellData,
}