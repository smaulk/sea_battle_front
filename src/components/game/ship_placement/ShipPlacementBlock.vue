<script lang="ts" setup>
import { onMounted, Ref, ref, watch } from "vue";
import FindCellModule from "game/modules/FindCellModule.ts";
import { ShipData } from "game/interfaces/ShipData";
import DragModule from "game/modules/DragModule";
import ShipPlacementModule from "game/modules/ShipPlacementModule";
import ShipsCounter from "game/classes/ShipsCounter";
import Battlefield from "components/game/battlefield/Battlefield.vue";
import ShipContainer from "components/game/ship_placement/ShipsContainer.vue";
import CellCreator from "game/classes/CellCreator";
import { CellsMatrix } from "game/interfaces/CellsMatrix";


const emits = defineEmits(['update:cellsArray', 'update:shipsArray', 'update:placedShipsCount']);
const { cellsArray, shipsArray, shipCounter } = defineProps({
  cellsArray: Array,
  shipsArray: Array,
  shipCounter: ShipsCounter,
})


const cells: Ref<CellsMatrix> = ref(cellsArray as CellsMatrix);
const ships: Array<ShipData> = shipsArray as Array<ShipData>;

watch(cells.value, () => {
  emits('update:cellsArray', cells.value)
})


let dragModule: DragModule;
const shipsCounter: ShipsCounter = shipCounter as ShipsCounter;
onMounted(() => {
  dragModule = new DragModule(
      new ShipPlacementModule(cells.value, new CellCreator(cellElements.value)),
      new FindCellModule(cellElements.value),
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

const draggableShipId: Ref<number> = ref(-1);
const placedShips: Ref<Array<number>> = ref([]);
const dragLeft: Ref<number> = ref(0);
const dragTop: Ref<number> = ref(0);
const cellElements = ref();


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
const addEventsToWindow = (dragModuleInstance: DragModule) => {
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