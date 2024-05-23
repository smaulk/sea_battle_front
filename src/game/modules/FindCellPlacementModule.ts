import {getColRowData} from "./Functions.js";
import {ColRowData} from "../interfaces/ColRowData";
import {config} from "@/config";


export default class FindCellPlacementModule {

    private readonly cellCount: number;
    private readonly cellElements: Array<HTMLDivElement>;

    constructor(cellElements: Array<HTMLDivElement>) {
        this.cellCount = config.countCells;
        this.cellElements = cellElements;
    }


    public findCellToPlace(event: MouseEvent | TouchEvent, shipElem: HTMLDivElement): ColRowData | null {
        const idY = this.findOnY(event, shipElem);
        if (idY !== null) {

            return this.findOnX(event, shipElem, idY);
        }
        return null;
    }

    private findOnY(event: MouseEvent | TouchEvent, shipElem: HTMLDivElement): number | null {
        const cellRefs = this.cellElements;
        const rect = shipElem.getBoundingClientRect();
        const pageY = event instanceof MouseEvent ? event.pageY : event.changedTouches[0].pageY;
        const offsetY = pageY - rect.top - cellRefs[0].getBoundingClientRect().width / 2;
        const Y = pageY - offsetY;

        for (let i = 0; i < cellRefs.length; i += this.cellCount) {
            let elem = cellRefs[i];

            // Получаем координаты верхней и нижней границы элемента
            let elemTop = elem.getBoundingClientRect().top;
            let elemBottom = elem.getBoundingClientRect().bottom;

            // Если курсор или касание находится в пределах верхней и нижней границ элемента
            if (elemTop <= Y && Y < elemBottom) {
                return i;
            }
        }

        return null;
    }

    private findOnX(event: MouseEvent | TouchEvent, shipElem: HTMLDivElement, yId: number): ColRowData | null {
        const cellRefs = this.cellElements;
        const rect = shipElem.getBoundingClientRect();
        const pageX = event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;
        const offsetX = pageX - rect.left - cellRefs[0].getBoundingClientRect().width / 2;
        const X = pageX - offsetX;

        for (let i = yId; i < yId + this.cellCount; i++) {
            let elem: HTMLDivElement = cellRefs[i];

            // Получаем координаты левой и правой границ элемента
            let elemLeft = elem.getBoundingClientRect().left;
            let elemRight = elem.getBoundingClientRect().right;

            // Если курсор или касание находится в пределах левой и правой границ элемента
            if (elemLeft <= X && X < elemRight) {
                return getColRowData(elem);
            }
        }

        return null;
    }
}