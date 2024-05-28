import { Position } from "@/enums/Position.ts";

/**
 * Данные корабля
 */
export interface ShipData {
  id: number,
  size: number,
  position: Position,
}

