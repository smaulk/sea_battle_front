<script setup lang="ts">

import BattlefieldBlock from "components/game/battlefield/Battlefield.vue";
import {onMounted, ref} from "vue";
import ShipPlacementModule from "game/modules/ShipPlacementModule.ts";
import {getEmptyCells} from "game/utils";
import Ship from "components/game/battlefield/Ship.vue";
import BotModule from "game/modules/BotModule";
import GameModule from "game/modules/GameModule";
import CellCreator from "game/classes/CellCreator";
import RandomCellsModule from "game/modules/RandomCellsModule";
import ShipsCounter from "game/classes/ShipsCounter";
import {GameStatus} from "game/enums/GameStatus";
import GameEndWindow from "components/game/process_game_block/GameEndWindow.vue";
import {DifficultyLevel, DifficultyLevelRU} from "game/enums/DifficultyLevel";
import RivalDestroyedShips from "components/game/process_game_block/RivalDestroyedShips.vue";
import {BattlefieldData} from "game/interfaces/BattlefieldData";
import {CellsMatrix} from "game/interfaces/CellsMatrix.ts";
import {ShipData} from "game/interfaces/ShipData.ts";

const {cellsArray, shipsArray, difficultyLevel} = defineProps({
  cellsArray: Array,
  shipsArray: Array,
  difficultyLevel: String,
});

const emits = defineEmits(['reloadGame']);

const selfCellElements = ref();
const rivalCellElements = ref();

const battlefieldSelf = ref();
const battlefieldRival = ref();


let shipPlacementModule: ShipPlacementModule;
let gameModule: GameModule;
let botModule: BotModule;
const rivalShipsCounter: ShipsCounter = new ShipsCounter();

onMounted(() => {
  shipPlacementModule = new ShipPlacementModule(
      getEmptyCells(),
      new CellCreator(selfCellElements.value)
  );
  shipPlacementModule.placeShipsFromCells(cellsArray as CellsMatrix, shipsArray as Array<ShipData>);

  const battlefieldData: BattlefieldData = new RandomCellsModule()
      .getRandomBattlefieldData(new ShipsCounter().getShipsArray()) as BattlefieldData;
  botModule = new BotModule(
      battlefieldData.cells,
      battlefieldData.ships,
      difficultyLevel as DifficultyLevel
  );

  gameModule = new GameModule(
      botModule,
      rivalShipsCounter,
      cellsArray as CellsMatrix,
      shipsArray as Array<ShipData>,
      new CellCreator(rivalCellElements.value),
      new CellCreator(selfCellElements.value),
      battlefieldSelf.value,
      battlefieldRival.value
  );


  rivalCellElements.value.forEach((cell: HTMLDivElement) => {
    cell.addEventListener('click', clickEnemyCell)
  })

})


const gameInfo = ref(GameStatus.InProgress);

/*
  Обработка нажатия на клетку противника.
*/
const clickEnemyCell = async (event: Event) => {
  const info: GameStatus | null = await gameModule.gameHandler(event);
  if (info !== null) gameInfo.value = info;
}

const getRivalShipsRemainingCount = (size: number): number => {
  return rivalShipsCounter.getRemainingCount(size);
}

</script>

<template>
  <div class="py-3 py-xxl-0">
    <div>
      <p class="h5">Уровень сложности: {{ DifficultyLevelRU[difficultyLevel as DifficultyLevel] }}</p>
    </div>


    <div class="d-flex justify-content-center row gap-4 gap-xl-0">

      <div class="col-12 col-xl-6 col-xxl-5 battlefield__self "
           ref="battlefieldSelf">
        <p class="h1 text-center not-highlight">Ваше поле</p>
        <BattlefieldBlock v-model:cells="selfCellElements"/>
        <Ship v-for="ship in shipsArray as Array<ShipData>"
              :ship-data="ship"
              style="cursor: default"
        />
      </div>

      <div
          class="col-12 col-xl-6 col-xxl-7 battlefield__rival d-flex justify-content-center align-items-center
           mx-0 gap-3 row"
          ref="battlefieldRival">
        <div class="col-12 col-sm-8 col-lg-7 col-xl-12 col-xxl-8">
          <p class="h1 text-center not-highlight">Поле противника</p>
          <BattlefieldBlock v-model:cells="rivalCellElements"/>
        </div>
          <RivalDestroyedShips class="col" :get-remaining-count="getRivalShipsRemainingCount"/>
      </div>

      <GameEndWindow v-if="gameInfo" :game-info="gameInfo" @reload-game="emits('reloadGame')"/>
    </div>
  </div>

</template>

<style lang="scss">

.battlefield__self {

}

.battlefield__rival {
  .battlefield-cell__empty {
    cursor: pointer;

    &:hover {
      background-color: #f5cf8f;
    }
  }
}


</style>