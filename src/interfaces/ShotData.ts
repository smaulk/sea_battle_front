import { ColRowData } from "./ColRowData.ts";
import { ShotStatus } from "@/enums/ShotStatus.ts";
import { ShipData } from "@/interfaces/ShipData.ts";

/**
 * Данные выстрела
 */
export interface ShotData {
  //Статус выстрела
  shot: ShotStatus,
  //Подбитый корабль
  ship: ShipData | null,
  //Первая клетка корабля
  startCell: ColRowData | null,
}