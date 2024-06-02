<script lang="ts" setup>
import { Position } from "@/enums/Position.ts";

const { getRemainingCount } = defineProps({
  getRemainingCount: Function,
})

const remainingCount = (size: number): number | null => {
  if (getRemainingCount) {
    return getRemainingCount(size);
  }
  return null;
}
</script>

<template>
  <div class="d-flex flex-column align-items-center">
    <p class="h5 text-center">Корабли противника</p>
    <div class="ship-container">
      <div v-for="size in [4, 3, 2, 1]"
           :key="`ships-${size}`"
           class="ships">

        <div
            :class="['ship', 'static', remainingCount(size) === 0 ? 'ship-destroyed': null]"
            :data-position="Position.Horizontal"
            :data-size="size"
        >
          <span class="symbol"></span>
        </div>

        <span class="ship-count not-highlight">{{ remainingCount(size) }}</span>
      </div>
    </div>
  </div>

</template>

<style lang="scss" scoped>
.ship {
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
      height: calc(var(--game-grid-cell-size) / 12); /* Высота псевдоэлементов */
      background-color: red; /* Цвет псевдоэлементов */
    }
  }
}
</style>