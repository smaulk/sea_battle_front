<script lang="ts" setup>
import Battlefield from "components/Battlefield.vue";
import { onMounted, ref } from "vue";
import ShipPlacementService from "@/services/ShipPlacementService.ts";
import Ship from "components/Ship.vue";
import BotService from "@/services/BotService.ts";
import GameDisplayService from "@/services/GameDisplayService.ts";
import CellCreatorService from "@/services/CellCreatorService.ts";
import ShipsCounterService from "@/services/ShipsCounterService.ts";
import { GameStatus } from "@/enums/GameStatus.ts";
import GameEndModal from "components/GameEndModal.vue";
import { DifficultyLevel, DifficultyLevelRU } from "@/enums/DifficultyLevel.ts";
import RivalShipsContainer from "components/RivalShipsContainer.vue";
import { BattlefieldData } from "@/interfaces/BattlefieldData.ts";
import { CellsMatrix } from "@/interfaces/CellsMatrix.ts";
import { ShipData } from "@/interfaces/ShipData.ts";
import ShotService from "@/services/ShotService.ts";
import { GameHandlerService } from "@/services/GameHandlerService.ts";

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

const battlefieldData: BattlefieldData = {
  cells: cellsArray as CellsMatrix,
  ships: shipsArray as Array<ShipData>
}

let shipPlacementService: ShipPlacementService;
let gameDisplay: GameDisplayService;
let userController: ShotService;
let botController: BotService;
let gameHandler: GameHandlerService;
const rivalShipsCounter: ShipsCounterService = new ShipsCounterService();

onMounted(() => {
  shipPlacementService = new ShipPlacementService(new CellCreatorService(selfCellElements.value));
  shipPlacementService.placeShipsFromCells(battlefieldData);
  userController = new ShotService(battlefieldData);
  botController = new BotService(difficultyLevel as DifficultyLevel);
  gameDisplay = new GameDisplayService(
      rivalShipsCounter,
      new CellCreatorService(rivalCellElements.value),
      new CellCreatorService(selfCellElements.value),
      battlefieldSelf.value,
      battlefieldRival.value
  );
  gameHandler = new GameHandlerService(gameDisplay, userController, botController);

  rivalCellElements.value.forEach((cell: HTMLDivElement) => {
    cell.addEventListener('click', clickEnemyCell)
  })

})

const gameInfo = ref(GameStatus.InProgress);

/**
 * Обработка нажатия на клетку противника.
 */
const clickEnemyCell = async (event: Event) => {
  const info: GameStatus | null = await gameHandler.shot(event.target as HTMLDivElement);
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
        <Battlefield v-model:cells="selfCellElements"/>
        <Ship v-for="ship in shipsArray as Array<ShipData>"
              :ship-data="ship"
              class="static"
        />
      </div>

      <div
          ref="battlefieldRival"
          class="battlefield__rival col-12 col-xl-6 col-xxl-7 d-flex justify-content-center align-items-center
           mx-0 gap-3 row">
        <div class="col-12 col-sm-8 col-lg-7 col-xl-12 col-xxl-7">
          <p class="h2 text-center not-highlight">Поле противника</p>
          <Battlefield v-model:cells="rivalCellElements"/>
        </div>
        <RivalShipsContainer :get-remaining-count="getRivalShipsRemainingCount" class="col"/>
      </div>

      <GameEndModal v-if="gameInfo" :game-info="gameInfo" @reload-game="emits('reloadGame')"/>
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