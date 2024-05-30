<script lang="ts" setup>
import { onBeforeMount, onMounted, Ref, ref } from "vue";
import FindCellService from "@/services/FindCellService.ts";
import { ShipData } from "@/interfaces/ShipData.ts";
import DragDropService from "@/services/DragDropService.ts";
import ShipPlacementService from "@/services/ShipPlacementService.ts";
import ShipsCounter from "@/helpers/ShipsCounter.ts";
import Battlefield from "components/game/Battlefield.vue";
import ShipContainer from "components/game/PlacementShipsContainer.vue";
import CellCreator from "@/helpers/CellCreator.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";

const { cellsArray, shipsArray, shipCounter } = defineProps({
  cellsArray: Array,
  shipsArray: Array,
  shipCounter: ShipsCounter,
})

const cells: CellsMatrix = cellsArray as CellsMatrix;
const ships: Array<ShipData> = shipsArray as Array<ShipData>;
let dragModule: DragDropService;
const shipsCounter: ShipsCounter = shipCounter as ShipsCounter;

const draggableShipId: Ref<number> = ref(-1);
const placedShips: Ref<Array<number>> = ref([]);
const dragLeft: Ref<number> = ref(0);
const dragTop: Ref<number> = ref(0);
const cellElements = ref();

onBeforeMount(() => {
  ships.push(...shipsCounter.getShipsArray())
})

onMounted(() => {
  dragModule = new DragDropService(
      new ShipPlacementService(new CellCreator(cellElements.value), cells),
      new FindCellService(cellElements.value),
      shipsCounter,
      ships,
      dragLeft,
      dragTop,
      draggableShipId,
      placedShips
  );
  addEventsToWindow(dragModule);
})

const randomPlacement = () => {
  dragModule.randomPlace();
}

const dragStartEvent = (event: MouseEvent | TouchEvent, ship: ShipData) => {
  dragModule.dragStartEvent(event, ship)
}

const getRemainingCount = (shipSize: number) => {
  return shipsCounter.getRemainingCount(shipSize);
}

const isDragging = (shipId: number): boolean => {
  return draggableShipId.value === shipId;
}

const leftByKey = (shipId: number): string | 0 => {
  return isDragging(shipId) ? dragLeft.value + 'px' : 0
}

const topByKey = (shipId: number): string | 0 => {
  return isDragging(shipId) ? dragTop.value + 'px' : 0
}

function getShipStyle(shipId: number): Object {
  return {
    left: leftByKey(shipId),
    top: topByKey(shipId)
  };
}

const getShipsBySize = (size: number): Array<ShipData> => {
  return ships.filter(ship => ship.size === size);
}

/**
 * Добавление эвентов для перемещения к окну.
 */
const addEventsToWindow = (dragModuleInstance: DragDropService) => {
  window.addEventListener('mousemove', (event) => dragModuleInstance.movingEvent(event));
  window.addEventListener('touchmove', (event) => dragModuleInstance.movingEvent(event));
  window.addEventListener('mouseup', (event) => dragModuleInstance.dragStopEvent(event));
  window.addEventListener('touchend', (event) => dragModuleInstance.dragStopEvent(event));
  window.addEventListener('resize', () => dragModuleInstance.resizeEvent());
}
</script>

<template>
  <div
      class="d-flex align-items-center justify-content-center not-highlight row row-cols-1 row-cols-lg-2 gap-3 gap-lg-5">

    <Battlefield v-model:cells="cellElements"/>
    <ShipContainer
        :get-remaining-count="getRemainingCount"
        :get-ship-style="getShipStyle"
        :get-ships-by-size="getShipsBySize"
        @drag-start-event="dragStartEvent"
        @random-placement="randomPlacement"
    />

  </div>
</template>

<style lang="scss" scoped>

</style>