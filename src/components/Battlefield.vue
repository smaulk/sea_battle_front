<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { config } from "@/config.ts";

const emits = defineEmits(['update:cells'])

const cellElements = ref(null);
onMounted(() => {
  emits('update:cells', cellElements.value);
})

const getLetter = (i: number): string => {
  return String.fromCharCode(64 + i)
}
</script>

<template>
  <div class="battlefield-container">

    <div class="header-cell"></div>
    <div v-for="i in config.countCells" class="header-cell">{{ getLetter(i) }}</div>

    <template v-for="row in config.countCells">
      <div class="header-cell">{{ row }}</div>
      <div
          v-for="col in config.countCells"
          ref="cellElements"
          :data-col="col-1"
          :data-row="row-1"
          class="battlefield-cell battlefield-cell__empty"
      >
        <span class="symbol"></span>
      </div>
    </template>

  </div>
</template>

<style lang="scss">
.battlefield__wait {
  opacity: .6;
  pointer-events: none;
}

$box-shadow-cell: 0 0 1px calc(var(--game-grid-cell-size) / 75) black;
.battlefield-container {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(($game-grid-cell-count + 1), var(--game-grid-cell-size));
  grid-template-rows: repeat(($game-grid-cell-count + 1), var(--game-grid-cell-size));
  color: $game-grid-header-text-color;
  user-select: none;


  .battlefield-cell {
    box-sizing: border-box;
    position: relative;
    background-color: $game-grid-cell-color;
    box-shadow: $box-shadow-cell;

    .ship {
      z-index: 1000;
    }

  }

  @keyframes pulse {
    0% {
      background-color: darken($game-grid-cell-color, 5%);
    }
    100% {
      background-color: #eeee08;
    }
  }

  .battlefield-cell__last {
    animation: pulse 2s infinite alternate;
  }

  .battlefield-cell__miss {
    .symbol {
      animation: appear-symbol 0.2s ease forwards; /* Применяем анимацию появления */
    }
  }

  .battlefield-cell__miss-auto {
    .symbol {
      animation: appear-symbol 1s ease forwards; /* Применяем анимацию появления */
    }

  }

  .battlefield-cell__miss, .battlefield-cell__miss-auto {
    background-color: darken($game-grid-cell-color, 5%);

    .symbol {
      width: 15%; /* Диаметр круга */
      height: 15%; /* Диаметр круга */
      background-color: lighten(black, 45%); /* Цвет круга */
      border-radius: 50%; /* Круглый круг */
      position: absolute; /* Абсолютное позиционирование внутри клетки */
      top: 50%; /* Расположение круга по вертикали */
      left: 50%; /* Расположение круга по горизонтали */
      transform: translate(-50%, -50%); /* Центрирование круга */
    }
  }

  .battlefield-cell__destroyed {
    .ship {
      border: calc(var(--game-grid-cell-size) / 15) solid red;
      animation: appear-ship 0.5s ease forwards; /* Применяем анимацию появления */
    }
  }

  @keyframes appear-symbol {
    from {
      transform: translate(-50%, -50%) scale(0); /* Начальное состояние: невидимый */
    }
    to {
      transform: translate(-50%, -50%) scale(1); /* Конечное состояние: полный размер */
    }
  }

  @keyframes appear-ship {
    from {
      transform: scale(0); /* Начальное состояние: невидимый */
    }
    to {
      transform: scale(1); /* Конечное состояние: полный размер */
    }
  }

  .battlefield-cell__hit, .battlefield-cell__destroyed {
    .symbol {
      z-index: 1001;
      position: absolute; /* Абсолютное позиционирование внутри клетки */
      top: 50%; /* Расположение креста по вертикали */
      left: 50%; /* Расположение креста по горизонтали */
      transform: translate(-50%, -50%); /* Центрирование креста */
      width: 100%; /* Ширина креста */
      animation: appear-symbol 0.4s ease forwards; /* Применяем анимацию появления */

      &::before,
      &::after {
        content: ''; /* Пустое содержимое для псевдоэлементов */
        position: absolute; /* Абсолютное позиционирование */
        width: 100%; /* Ширина псевдоэлементов */
        height: calc(var(--game-grid-cell-size) / 15); /* Высота псевдоэлементов */
        background-color: red; /* Цвет псевдоэлементов */
      }

      &::before {
        transform: rotate(45deg); /* Поворот первого псевдоэлемента */
      }

      &::after {
        transform: rotate(-45deg); /* Поворот второго псевдоэлемента */

      }
    }

  }

  .battlefield-cell__ship-allowed {
    background-color: limegreen;
    box-shadow: 0 0 1px 0.2px black;
  }

  .header-cell {
    box-shadow: $box-shadow-cell;
    font-size: calc(var(--game-grid-cell-size) / 2.5);
    box-sizing: border-box;
    background-color: $game-grid-header-color;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>