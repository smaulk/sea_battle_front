<script lang="ts" setup>
import { onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import GameStartBlock from "components/GameStartBlock.vue";
import GameProcessBlock from "components/GameProcessBlock.vue";
import { ShipData } from "@/interfaces/ShipData.ts";
import { useRoute } from "vue-router";
import { DifficultyLevel } from "@/enums/DifficultyLevel.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";

let gameIsStarted = ref(false)
let cellsArray: CellsMatrix = []
let shipsArray: Array<ShipData> = []

const startGame = (cells: CellsMatrix, ships: Array<ShipData>) => {
  gameIsStarted.value = true;
  cellsArray = cells;
  shipsArray = ships
}

onMounted(() => {
  window.addEventListener('beforeunload', updateAlert);
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', updateAlert);
})
/** Вывод предупреждения при выходе со страницы или ее обновлении */
const updateAlert = (e: Event) => {
  (e || window.event).returnValue = true;
}

const reloadGame = () => {
  gameIsStarted.value = false;
}

const route = useRoute();
/**
 * При установке легкого режима, бот будет играть в легком режиме,
 * в остальных случаях бот будет играть в нормальном режиме
 */
let difficultyLevel: DifficultyLevel = DifficultyLevel.Normal;
onBeforeMount(() => {
  const level = route.query.difficulty;
  if (level === DifficultyLevel.Easy) {
    difficultyLevel = DifficultyLevel.Easy;
  }
})
</script>

<template>
  <div :key="$route.fullPath">
    <GameProcessBlock v-if="gameIsStarted" :cells-array="cellsArray" :difficulty-level="difficultyLevel"
                      :ships-array="shipsArray" @reload-game="reloadGame"/>
    <GameStartBlock v-else :difficulty-level="difficultyLevel" @start-game="startGame"/>
  </div>
</template>

<style lang="scss" scoped>
</style>