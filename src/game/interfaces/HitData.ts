import {ColRowData} from "./ColRowData";
import {HitStatus} from "../enums/HitStatus";
import {ShipData} from "game/interfaces/ShipData.ts";

/*
    Данные выстрела
 */
export interface HitData {
    //Статус выстрела
    hit: HitStatus,
    //Подбитый корабль
    ship: ShipData | null,
    //Первая клетка корабля
    startCell: ColRowData | null,
}

/*
    Данные выстрела бота.
 */
export interface BotHitData {
    //Статус выстрела
    hit: HitStatus,
    //Пустые клетки вокруг корабля, если он убит
    emptyCells: Array<ColRowData> | null,
}

