import {ColRowData} from "../interfaces/ColRowData";
import Cell from "./Cell";

export default class CellCreator {
    private readonly cellElements: Array<HTMLDivElement>;

    constructor(cellElements: Array<HTMLDivElement>) {
        this.cellElements = cellElements;
    }

    public create(cellData: ColRowData): Cell | null {
        const elem = this.getElementByCellData(cellData);
        return Cell.create(cellData, elem);
    }

    private getElementByCellData(cellData: ColRowData): HTMLDivElement | null {
        const selector = `.battlefield-cell[data-row="${cellData.row}"][data-col="${cellData.col}"]`;

        for (const elem of this.cellElements) {
            if (elem.matches(selector)) {
                return elem;
            }
        }
        return null;
    }


}