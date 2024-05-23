<script setup lang="ts">

import { Position } from "game/enums/Position";

const { getRemainingCount } = defineProps({
  getRemainingCount: Function,
})


</script>

<template>
  <div class="ship-container">
    <p class="h5 text-center">Корабли противника</p>
    <div class="ships"
         v-for="size in [4, 3, 2, 1]"
         :key="`ships-${size}`">

      <div
          :class="['ship', getRemainingCount(size) === 0 ? 'ship-destroyed': null]"
          :data-size="size"
          :data-position="Position.Horizontal"
      >
        <span class="symbol"></span>
      </div>

      <span class="ship-count not-highlight">{{ getRemainingCount(size) }}</span>
    </div>

  </div>
</template>

<style scoped lang="scss">
.ship {
  cursor: default;
  top: 0;
  left: 0;

  @for $i from 1 through 4 {
    &[data-size="#{$i}"] {
      &.ship-destroyed .symbol::before {
        transform: rotate(calc(45/$i)+deg); /* Поворот первого псевдоэлемента */
      }

      &.ship-destroyed .symbol::after {
        transform: rotate(- calc(45/$i)+deg); /* Поворот второго псевдоэлемента */
      }
    }
  }

}

.ship-destroyed {

  .symbol {
    z-index: 1001;
    position: absolute; /* Абсолютное позиционирование внутри клетки */
    top: 50%; /* Расположение креста по вертикали */
    left: 50%; /* Расположение креста по горизонтали */
    transform: translate(-50%, -50%); /* Центрирование креста */
    width: 110%; /* Ширина креста */
    animation: appear-symbol 0.2s ease forwards; /* Применяем анимацию появления */

    &::before,
    &::after {
      content: ''; /* Пустое содержимое для псевдоэлементов */
      position: absolute; /* Абсолютное позиционирование */
      width: 100%; /* Ширина псевдоэлементов */
      height: calc(var(--game-grid-cell-size)/12); /* Высота псевдоэлементов */
      background-color: red; /* Цвет псевдоэлементов */
    }
  }
}
</style>