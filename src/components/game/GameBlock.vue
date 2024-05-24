<script setup lang="ts">

import {onBeforeMount, onMounted, onUnmounted, ref} from "vue";
import StartGameBlock from "components/game/start_game_block/StartGameBlock.vue";
import ProcessGameBlock from "components/game/process_game_block/ProcessGameBlock.vue";
import {ShipData} from "game/interfaces/ShipData";
import {useRoute} from "vue-router";
import {DifficultyLevel} from "game/enums/DifficultyLevel";
import {CellsMatrix} from "game/interfaces/CellsMatrix";

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
/* Вывод предупреждения при выходе со страницы или ее обновлении */
const updateAlert = (e: Event) => {
  (e || window.event).returnValue = true;
}

const reloadGame = () => {
  gameIsStarted.value = false;
}


const route = useRoute();
/*
  При установке легкого режима, бот будет играть в легком режиме,
  в остальных случаях бот будет играть в нормальном режиме
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
    <ProcessGameBlock :cells-array="cellsArray" :ships-array="shipsArray" :difficulty-level="difficultyLevel"
                      v-if="gameIsStarted" @reload-game="reloadGame"/>
    <StartGameBlock @start-game="startGame" :difficulty-level="difficultyLevel" v-else/>
  </div>
</template>

<style scoped lang="scss">

</style>