<script lang="ts" setup>
import { onBeforeMount, onMounted, Ref, ref } from "vue";
import FindCellService from "@/services/FindCellService.ts";
import { ShipData } from "@/interfaces/ShipData.ts";
import DragDropService from "@/services/DragDropService.ts";
import ShipPlacementService from "@/services/ShipPlacementService.ts";
import ShipsCounterService from "@/services/ShipsCounterService.ts";
import Battlefield from "components/Battlefield.vue";
import PlacementShipsContainer from "components/PlacementShipsContainer.vue";
import CellCreatorService from "@/services/CellCreatorService.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";

const { cellsArray, shipsArray, shipCounter } = defineProps({
  cellsArray: Array,
  shipsArray: Array,
  shipCounter: ShipsCounterService,
})

const cells: CellsMatrix = cellsArray as CellsMatrix;
const ships: Array<ShipData> = shipsArray as Array<ShipData>;
let dragDropService: DragDropService;
const shipsCounter: ShipsCounterService = shipCounter as ShipsCounterService;

const draggableShipId: Ref<number> = ref(-1);
const placedShips: Ref<Array<number>> = ref([]);
const dragLeft: Ref<number> = ref(0);
const dragTop: Ref<number> = ref(0);
const cellElements = ref();

onBeforeMount(() => {
  ships.push(...shipsCounter.getShipsArray())
})

onMounted(() => {
  dragDropService = new DragDropService(
      new ShipPlacementService(new CellCreatorService(cellElements.value), cells),
      new FindCellService(cellElements.value),
      shipsCounter,
      ships,
      dragLeft,
      dragTop,
      draggableShipId,
      placedShips
  );
  addEventsToWindow(dragDropService);
})

const randomPlacement = () => {
  dragDropService.randomPlace();
}

const dragStartEvent = (event: MouseEvent | TouchEvent, ship: ShipData) => {
  dragDropService.dragStartEvent(event, ship)
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
const addEventsToWindow = (dragDropService: DragDropService) => {
  window.addEventListener('mousemove', (event) => dragDropService.movingEvent(event));
  window.addEventListener('touchmove', (event) => dragDropService.movingEvent(event));
  window.addEventListener('mouseup', (event) => dragDropService.dragStopEvent(event));
  window.addEventListener('touchend', (event) => dragDropService.dragStopEvent(event));
  window.addEventListener('resize', () => dragDropService.resizeEvent());
}
</script>

<template>
  <div
      class="d-flex align-items-center justify-content-center not-highlight row row-cols-1 row-cols-lg-2 gap-3 gap-lg-5">

    <Battlefield v-model:cells="cellElements"/>
    <PlacementShipsContainer
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