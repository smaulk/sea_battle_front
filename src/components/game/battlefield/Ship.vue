<script setup lang="ts">

import {ShipData} from "game/interfaces/ShipData.ts";

const props = defineProps({
  shipData: Object,
})
const shipData: ShipData = props.shipData as ShipData;

</script>

<template>
  <div
      class="ship"
      :data-id="shipData.id"
      :data-size="shipData.size"
      :data-position="shipData.position"
      :key="shipData.id">
  </div>
</template>

<style lang="scss">

.ship {
  cursor: move;
  touch-action: none;
  position: absolute;
  //background-color: blue;
  background-size: contain;
  background-repeat: no-repeat;
  background-origin: border-box;

  &.default {
    cursor: default;
    top: 0;
    left: 0;
    background-color: lighten($background-color, 10%) !important;
    border: 2px solid darken($background-color, 10%) !important;
    background-image: none !important;
  }


  &[data-position="horizontal"] {
    height: var(--game-grid-cell-size);

    @for $i from 1 through 4 {
      &[data-size="#{$i}"] {
        width: calc($i * var(--game-grid-cell-size));
        background-image: map-get($ships-h, $i);
      }
    }

  }

  &[data-position="vertical"] {
    width: var(--game-grid-cell-size);

    @for $i from 1 through 4 {
      &[data-size="#{$i}"] {
        height: calc($i * var(--game-grid-cell-size));
        background-image: map-get($ships-v, $i);;
      }
    }

  }

}

.dragging {
  z-index: 1001 !important;
}


.ship-place-forbidden {
  border: 3px solid red !important;
  background-color: rgba(255, 0, 0, 0.5) !important;
}


@keyframes shake {
  20%, 80% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }
}

.shake-animation {
  animation: shake 0.3s ease;
}

</style>