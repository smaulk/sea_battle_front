<script lang="ts" setup>
import { ShipData } from "@/interfaces/ShipData.ts";

const props = defineProps({
  shipData: Object,
})
const shipData: ShipData = props.shipData as ShipData;
</script>

<template>
  <div
      :key="shipData.id"
      :data-id="shipData.id"
      :data-position="shipData.position"
      :data-size="shipData.size"
      class="ship">
  </div>
</template>

<style lang="scss">
.ship {
  cursor: move;
  touch-action: none;
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-origin: border-box;

  &.static {
    touch-action: auto;
    cursor: default;
  }

  &.default {
    @extend .static;
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