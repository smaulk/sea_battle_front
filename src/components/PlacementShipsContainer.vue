<script lang="ts" setup>
import { ShipData } from "@/interfaces/ShipData.ts";
import Ship from "components/Ship.vue";
import { Position } from "@/enums/Position.ts";

const {
  getShipStyle,
  getShipsBySize,
  getRemainingCount,
} = defineProps({
  getShipStyle: Function,
  getShipsBySize: Function,
  getRemainingCount: Function,
})

const emits = defineEmits(['dragStartEvent', 'randomPlacement']);

const dragStartEvent = (event: MouseEvent | TouchEvent, ship: ShipData): void => {
  emits('dragStartEvent', event, ship)
}
const randomPlacement = (): void => {
  emits('randomPlacement')
}

const shipsBySize = (size: number): Array<ShipData> | null => {
  if (getShipsBySize) {
    return getShipsBySize(size);
  }
  return null;
}
const shipStyle = (shipId: number): Object | null => {
  if (getShipStyle) {
    return getShipStyle(shipId);
  }
  return null;
}

const remainingCount = (size: number): number | null => {
  if (getRemainingCount) {
    return getRemainingCount(size);
  }
  return null;
}

</script>

<template>
  <div class="ship-container">
    <div v-for="size in [4, 3, 2, 1]"
         :key="`ships-${size}`"
         class="ships">

      <div
          :class="['ship', 'default']"
          :data-position="Position.Horizontal"
          :data-size="size"
      ></div>

      <Ship
          v-for="ship in shipsBySize(size)"
          :ship-data="ship"
          :style="shipStyle(ship.id)"
          v-on:mousedown="dragStartEvent($event, ship)"
          v-on:touchstart.prevent="dragStartEvent($event, ship)"
      />

      <span class="ship-count not-highlight">{{ remainingCount(size) }}</span>
    </div>
    <button class="mt-3 btn btn-danger btn-random" @click="randomPlacement">
      Расставить случайно
    </button>

    <div class="preload-images-vertical"></div>
  </div>

</template>

<style lang="scss">

.btn-random {
  padding: calc(var(--game-grid-cell-size) / 5);
  font-size: calc(0.8rem + 0.4vw);
  border-radius: 5px;
}

.preload-images-vertical {
  position: absolute;
  left: -9999px;
  top: -9999px;
  visibility: hidden;

  &:after {
    content: map-get($ships-v, 1) map-get($ships-v, 2) map-get($ships-v, 3) map-get($ships-v, 4);
  }
}

.ship-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: calc(5.5 * var(--game-grid-cell-size));


  .ships {
    display: flex;
    justify-content: right;
    align-items: center;
    position: relative;
    height: var(--game-grid-cell-size);

    .ship-count {
      font-size: calc(var(--game-grid-cell-size) / 1.8);
      position: relative;

    }
  }
}


</style>