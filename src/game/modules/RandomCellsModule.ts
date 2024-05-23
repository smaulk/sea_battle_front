import { ShipData } from "../interfaces/ShipData";
import {getEmptyCells, getRandomInt} from "./Functions";
import { Position } from "../enums/Position";
import { ColRowData } from "../interfaces/ColRowData";
import ShipPlaceValidationModule from "./ShipPlaceValidationModule";
import {BattlefieldData} from "../interfaces/BattlefieldData";
import {CellsMatrix} from "../interfaces/CellsMatrix";


export default class RandomCellsModule {

    private _cells: CellsMatrix;
    private _ships: Array<ShipData>;
    private validationModule: ShipPlaceValidationModule;

    constructor() {
        this._cells = getEmptyCells();
        this._ships = [];
        this.validationModule = new ShipPlaceValidationModule(this._cells);
    }


    public getBattlefieldData(ships: Array<ShipData>): BattlefieldData| null {
        this._ships = ships;
        for (let attempt = 0; attempt < 1000; attempt++) {
            if (this.placeAllShips()) {
                return {
                    cells: this._cells,
                    ships: this._ships
                };
            }
            this.resetCells();
        }
        return null;
    }

    private placeAllShips(): boolean {
        for (let i = 0; i < this._ships.length; i++) {
            if (!this.placeShip(i)) {
                return false;
            }
        }
        return true;
    }

    private placeShip(i : number): boolean {
        let attempts = 50;
        while (attempts-- > 0) {
            const { col, row, position } = this.getRandomPosition();
            this._ships[i] = { ...this._ships[i], position };
            if (this.validationModule.checkCellsForPlacement(this._ships[i], { col, row })) {
                this.setShip(this._ships[i], { col, row });
                return true;
            }
        }
        return false;
    }

    private getRandomPosition(): { col: number, row: number, position: Position } {
        const size = this._cells.length;
        const col = getRandomInt(size);
        const row = getRandomInt(size);
        const position = Math.random() > 0.5 ? Position.Horizontal : Position.Vertical;
        return { col, row, position };
    }

    private setShip(ship: ShipData, start: ColRowData): void {
        for (let i = 0; i < ship.size; i++) {
            const col = ship.position === Position.Horizontal ? start.col + i : start.col;
            const row = ship.position === Position.Vertical ? start.row + i : start.row;
            this._cells[row][col] = ship.id;
        }
    }

    private resetCells(): void {
        this._cells = getEmptyCells();
    }


}
