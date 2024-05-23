import {Ref} from "vue";
import {ShipData} from "../interfaces/ShipData";
import {Coordinates} from "../interfaces/Coordinates";
import FindCellPlacementModule from "./FindCellPlacementModule";
import ShipsCounter from "../classes/ShipsCounter";
import Ship from "../classes/Ship";
import ShipPlacementModule from "./ShipPlacementModule";
import RandomCellsModule from "./RandomCellsModule";
import {BattlefieldData} from "../interfaces/BattlefieldData";


export default class DragModule {

    private clickFlag: boolean;
    private draggableShipId: Ref<number>;
    private readonly placedShips: Ref<Array<number>>;
    private shipInitialCoordinates: Coordinates;
    private dragLeft: Ref<number>;
    private dragTop: Ref<number>

    private ships: Array<ShipData>;

    private readonly shipPlacementModule: ShipPlacementModule
    private readonly findCellPlacementModule: FindCellPlacementModule;
    private shipsCounter: ShipsCounter;

    constructor(shipPlacementModule: ShipPlacementModule,
                findCellPlacementModule: FindCellPlacementModule,
                shipsCounter: ShipsCounter, ships: Array<ShipData>,
                dragLeft: Ref<number>, dragTop: Ref<number>,
                draggableShipId: Ref<number>, placedShips: Ref<Array<number>>) {
        this.clickFlag = false;
        this.draggableShipId = draggableShipId;
        this.placedShips = placedShips;
        this.shipInitialCoordinates = {
            X: 0,
            Y: 0,
        }

        this.shipPlacementModule = shipPlacementModule;
        this.findCellPlacementModule = findCellPlacementModule;
        this.shipsCounter = shipsCounter;
        this.ships = ships;
        this.dragLeft = dragLeft;
        this.dragTop = dragTop;


    }


    public dragStartEvent(event: MouseEvent | TouchEvent, shipData: ShipData): void {

        const shipElem: HTMLDivElement = event.target as HTMLDivElement;
        if (!shipElem.classList.contains('dragging')) this.clickFlag = true;
        if (this.draggableShipId.value === shipData.id) {
            return
        }
        this.draggableShipId.value = shipData.id;
        shipElem.classList.add('dragging');

        if (!this.shipIsPlaced()) {
            this.shipsCounter.decrementRemaining(shipData.size);
        }

        this.shipInitialCoordinates.X = this.getPageX(event);
        this.shipInitialCoordinates.Y = this.getPageY(event);

    }


    public movingEvent(event: MouseEvent | TouchEvent): void {

        if (this.draggableShipId.value < 0) {
            return;
        }

        this.clickFlag = false;
        this.dragLeft.value = this.getPageX(event) - this.shipInitialCoordinates.X;
        this.dragTop.value = this.getPageY(event) - this.shipInitialCoordinates.Y;

        const ship = this.getShipById(this.draggableShipId.value);
        if (!ship || !ship.isDragging()) return;

        this.shipPlacementModule.removeShipAllowed(ship);

        const newCell = ship.getNewColRowData(this.findCellPlacementModule, event);
        if (newCell) {
            const oldCell = ship.getCurrentColRowData();
            if (oldCell) {
                this.shipPlacementModule.removeShipFromCell(oldCell, ship);
                this.shipPlacementModule.placeShipCheck(newCell, ship);
                this.shipPlacementModule.placeShipToCell(oldCell, ship);
            } else {
                this.shipPlacementModule.placeShipCheck(newCell, ship);
            }

        } else {
            ship.setClassForbidden();
        }

    }

    public dragStopEvent(event: MouseEvent | TouchEvent): void {

        if (this.draggableShipId.value < 0) {
            return;
        }

        const ship = this.getShipById(this.draggableShipId.value);
        if (!ship || !ship.isDragging()) return;

        this.shipPlacementModule.removeShipAllowed(ship);

        ship.removeDragging();

        if (this.clickFlag) {
            if (this.shipIsPlaced()) this.shipClick(ship)
            else this.shipsCounter.incrementRemaining(ship.shipData.size);
        } else {
            const newCell = ship.getNewColRowData(this.findCellPlacementModule, event);

            if (newCell) {
                const oldCell = ship.getCurrentColRowData();

                if (oldCell) this.shipPlacementModule.removeShipFromCell(oldCell, ship);

                const isPlace = this.shipPlacementModule.placeShipToCell(newCell, ship);

                if (!isPlace && oldCell) this.shipPlacementModule.placeShipToCell(oldCell, ship);

                if (!this.shipIsPlaced()) {
                    if (isPlace) {
                        this.placedShips.value.push(this.draggableShipId.value)
                        this.shipsCounter.incrementPlaced();
                    } else this.shipsCounter.incrementRemaining(ship.shipData.size);
                }

            } else if (!this.shipIsPlaced()) this.shipsCounter.incrementRemaining(ship.shipData.size);
        }


        this.clearValues();
    }


    private shipClick(ship: Ship): void {
        if (ship.shipData.size === 1) {
            ship.changePosition();
            return;
        }

        this.shipPlacementModule.removeShipAllowed(ship);

        const oldCell = ship.getCurrentColRowData();
        if (oldCell) {
            this.shipPlacementModule.removeShipFromCell(oldCell, ship);
            ship.changePosition();
            const isPlace = this.shipPlacementModule.placeShipToCell(oldCell, ship);

            if (!isPlace) {
                ship.changePosition();
                this.shipPlacementModule.placeShipToCell(oldCell, ship);
                ship.setAnimateForbidden();
            }
        }

    }


    private getShipById(shipId: number): Ship | null {
        return Ship.create(
            this.ships.find(ship => ship.id === shipId) as ShipData
        );
    }

    private shipIsPlaced(): boolean {
        if (this.draggableShipId.value < 0) return false;
        return this.placedShips.value.indexOf(this.draggableShipId.value) !== -1;
    }

    private clearValues(): void {
        // сбрасываем все значения к начальным
        this.draggableShipId.value = -1;
        this.dragLeft.value = 0;
        this.dragTop.value = 0;
    }

    private getPageX(event: MouseEvent | TouchEvent): number {
        if (event instanceof MouseEvent) {
            return event.pageX;
        } else {
            return event.changedTouches[0].pageX;
        }
    }

    private getPageY(event: MouseEvent | TouchEvent): number {
        if (event instanceof MouseEvent) {
            return event.pageY;
        } else {
            return event.changedTouches[0].pageY;
        }
    }


    public resizeEvent(): void {
        if (this.draggableShipId.value === -1) return;
        const ship = this.getShipById(this.draggableShipId.value)
        if (!ship || !ship.isDragging()) return;

        this.shipPlacementModule.removeShipAllowed(ship);
        ship.removeDragging()
        if (!this.shipIsPlaced()) this.shipsCounter.incrementRemaining(ship.shipData.size);

        this.clearValues();
    }

    private fullPlacedShips(): void {
        this.clearPlacedShipsArray();
        for (let shipId of this.ships) {
            this.placedShips.value.push(shipId.id);
        }
    }

    private clearPlacedShipsArray(): void {
        this.placedShips.value.splice(0, this.placedShips.value.length);
    }


    public randomPlace(): void {
        const battlefieldData: BattlefieldData | null = new RandomCellsModule().getBattlefieldData(this.ships);
        if (!battlefieldData) return;
        this.ships = battlefieldData.ships;
        this.shipPlacementModule.placeShipsFromCells(battlefieldData.cells, this.ships);
        this.fullPlacedShips();
        this.shipsCounter.setAllPlaced();
    }
}