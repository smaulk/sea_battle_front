<script lang="ts" setup>

import BattlefieldBlock from "components/game/Battlefield.vue";
import { onMounted, ref } from "vue";
import ShipPlacementService from "@/services/ShipPlacementService.ts";
import { getEmptyCells } from "@/helpers";
import Ship from "components/game/Ship.vue";
import BotService from "@/services/BotService.ts";
import GameService from "@/services/GameService.ts";
import CellCreator from "@/helpers/CellCreator.ts";
import RandomCellsService from "@/services/RandomCellsService.ts";
import ShipsCounter from "@/helpers/ShipsCounter.ts";
import { GameStatus } from "@/enums/GameStatus.ts";
import GameEndWindow from "components/game/GameEndModal.vue";
import { DifficultyLevel, DifficultyLevelRU } from "@/enums/DifficultyLevel.ts";
import RivalDestroyedShips from "components/game/RivalShipsContainer.vue";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";
import { ShipData } from "@/interfaces/ShipData.ts";

const { cellsArray, shipsArray, difficultyLevel } = defineProps({
  cellsArray: Array,
  shipsArray: Array,
  difficultyLevel: String,
});

const emits = defineEmits(['reloadGame']);

const selfCellElements = ref();
const rivalCellElements = ref();

const battlefieldSelf = ref();
const battlefieldRival = ref();


let shipPlacementModule: ShipPlacementService;
let gameModule: GameService;
let botModule: BotService;
const rivalShipsCounter: ShipsCounter = new ShipsCounter();

onMounted(() => {
  shipPlacementModule = new ShipPlacementService(
      getEmptyCells(),
      new CellCreator(selfCellElements.value)
  );
  shipPlacementModule.placeShipsFromCells(cellsArray as CellsMatrix, shipsArray as Array<ShipData>);

  const battlefieldData: BattlefieldData = new RandomCellsService()
      .getRandomBattlefieldData(new ShipsCounter().getShipsArray()) as BattlefieldData;
  botModule = new BotService(
      battlefieldData.cells,
      battlefieldData.ships,
      difficultyLevel as DifficultyLevel
  );

  gameModule = new GameService(
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

/**
 * Обработка нажатия на клетку противника.
 */
const clickEnemyCell = async (event: Event) => {
  const info: GameStatus | null = await gameModule.gameHandler(event);
  if (info) gameInfo.value = info;
}

const getRivalShipsRemainingCount = (size: number): number => {
  return rivalShipsCounter.getRemainingCount(size);
}

</script>

<template>
  <div class="py-3 py-xxl-0">
    <div>
      <p class="h6">Уровень сложности: {{ DifficultyLevelRU[difficultyLevel as DifficultyLevel] }}</p>
    </div>

    <div class="d-flex justify-content-center row gap-4 gap-xl-0">

      <div ref="battlefieldSelf"
           class="battlefield__self battlefield__wait col-12 col-xl-6 col-xxl-5">
        <p class="h2 text-center not-highlight">Ваше поле</p>
        <BattlefieldBlock v-model:cells="selfCellElements"/>
        <Ship v-for="ship in shipsArray as Array<ShipData>"
              :ship-data="ship"
              class="static"
        />
      </div>

      <div
          ref="battlefieldRival"
          class="battlefield__rival col-12 col-xl-6 col-xxl-7 d-flex justify-content-center align-items-center
           mx-0 gap-3 row">
        <div class="col-12 col-sm-8 col-lg-7 col-xl-12 col-xxl-8">
          <p class="h2 text-center not-highlight">Поле противника</p>
          <BattlefieldBlock v-model:cells="rivalCellElements"/>
        </div>
        <RivalDestroyedShips :get-remaining-count="getRivalShipsRemainingCount" class="col"/>
      </div>

      <GameEndWindow v-if="gameInfo" :game-info="gameInfo" @reload-game="emits('reloadGame')"/>
    </div>
  </div>

</template>

<style lang="scss">
.battlefield__rival {
  .battlefield-cell__empty {
    cursor: pointer;

    &:hover {
      background-color: #f5cf8f;
    }
  }
}

</style>