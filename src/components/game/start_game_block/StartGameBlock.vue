<script setup lang="ts">

import {onBeforeMount, ref} from "vue";
import ShipPlacementBlock from "components/game/ship_placement/ShipPlacementBlock.vue";
import {getEmptyCells} from "game/utils";
import ShipsCounter from "game/classes/ShipsCounter";
import {ShipData} from "game/interfaces/ShipData";
import {DifficultyLevel, DifficultyLevelRU} from "game/enums/DifficultyLevel";
import {CellsMatrix} from "game/interfaces/CellsMatrix";

const {difficultyLevel} = defineProps({
  difficultyLevel: String,
})

const emits = defineEmits(['startGame'])

const cells: CellsMatrix = [];
const ships: Array<ShipData> = [];

const checkFilled = () => {
  isFilled.value = shipsCounter.isAllPlaced();
}
const isFilled = ref(true);

const startGameClick = () => {
  checkFilled();
  if (isFilled.value) {
    emits('startGame', cells, ships);
  }
}

let shipsCounter: ShipsCounter;

onBeforeMount(() => {
  cells.push(...getEmptyCells());
  shipsCounter = new ShipsCounter();
  ships.push(...shipsCounter.getShipsArray());
})


</script>

<template>
  <div class="row row-cols-1 row-cols-xl-2 d-flex justify-content-center justify-content-xl-between py-3">
    <div class=
             "col-10 col-xl-4 d-flex flex-column flex-lg-row flex-xl-column
             align-items-center align-items-lg-start align-items-xl-center justify-content-center gap-xl-2"
    >
      <div class="d-flex flex-column  col-12 col-sm-10 col-lg-6 col-xl-12 gap-1 gap-xl-3 text-center ">
        <p class="h1 my-0">Разместите корабли</p>
        <p class="h5">Уровень сложности: {{ DifficultyLevelRU[difficultyLevel as DifficultyLevel] }}</p>
      </div>
      <div class=
               "col-12 col-sm-10 col-lg-6 col-xl-12 d-flex flex-column
               align-items-center gap-1 gap-xl-3 start-block"
      >
        <div class="col-10 col-sm-8 col-xl-9">
          <button
              class="btn-u start-game-btn"
              @click="startGameClick"
          >
            Начать игру
          </button>
        </div>

        <p v-if="isFilled === false" class="start-block-alert">
          Для начала игры разместите все корабли!
        </p>
      </div>
    </div>
    <ShipPlacementBlock
        class="col-12 col-xl-8"
        v-model:cellsArray="cells"
        v-model:shipsArray="ships"
        :ship-counter="shipsCounter"
    />

  </div>

</template>

<style scoped lang="scss">
.start-game-btn {
  height: calc(var(--game-grid-cell-size) * 1.3);
  font-size: calc(var(--game-grid-cell-size) / 1.9);
}

.start-block {
  height: 100px;

  .start-block-alert {
    margin: 0;
    padding: 0;
    color: $important-color;
    font-size: 16px;

    @media (min-width: 768px) {
      font-size: 20px;
    }
  }

}
</style>
