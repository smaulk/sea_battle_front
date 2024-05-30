<script lang="ts" setup>
import { ref } from "vue";
import ShipPlacementBlock from "components/ShipPlacementBlock.vue";
import { ShipData } from "@/interfaces/ShipData.ts";
import { DifficultyLevel, DifficultyLevelRU } from "@/enums/DifficultyLevel.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";
import ShipsCounterService from "@/services/ShipsCounterService.ts";

const { difficultyLevel } = defineProps({
  difficultyLevel: String,
})
const emits = defineEmits(['startGame'])

let cells: CellsMatrix = [];
let ships: Array<ShipData> = [];
const shipCounter: ShipsCounterService = new ShipsCounterService();
const isAllPlaced = ref(true);

const checkIsAllPlaced = () => {
  isAllPlaced.value = shipCounter.isAllPlaced();
}

const startGameClick = () => {
  checkIsAllPlaced();
  if (isAllPlaced.value) {
    emits('startGame', cells, ships);
  }
}
</script>

<template>
  <div class="row row-cols-1 row-cols-xl-2 d-flex justify-content-center justify-content-xl-between py-3">
    <div class=
             "col-10 col-xl-4 d-flex flex-column flex-lg-row flex-xl-column
             align-items-center align-items-lg-start align-items-xl-center justify-content-center gap-xl-2"
    >
      <div class="d-flex flex-column  col-12 col-sm-10 col-lg-6 col-xl-12 gap-1 gap-xl-3 text-center ">
        <p class="h1 my-0">Разместите корабли</p>
        <p class="h6">Уровень сложности: {{ DifficultyLevelRU[difficultyLevel as DifficultyLevel] }}</p>
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

        <p v-if="isAllPlaced === false" class="start-block-alert">
          Для начала игры разместите все корабли!
        </p>
      </div>
    </div>
    <ShipPlacementBlock
        :cellsArray="cells"
        :ship-counter="shipCounter"
        :shipsArray="ships"
        class="col-12 col-xl-8"
    />

  </div>

</template>

<style lang="scss" scoped>
.start-game-btn {
  padding: calc(var(--game-grid-cell-size) / 4);
  font-size: calc(1.1rem + 0.5vw);
}

.start-block {
  height: 100px;

  .start-block-alert {
    margin: 0;
    padding: 0;
    color: $important-color;
    font-size: calc(0.9rem + 0.5vw);
  }

}
</style>
