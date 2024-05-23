import {ColRowData} from "./ColRowData";
import {HitStatus} from "../enums/HitStatus";

/*
    Данные выстрела
 */
export interface HitData{
    //Статус выстрела
    hit: HitStatus,
    //Пустые клетки вокруг корабля, если он убит
    emptyCells: Array<ColRowData> | null,
}