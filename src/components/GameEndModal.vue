<script lang="ts" setup>
import { GameStatus } from "@/enums/GameStatus.ts";
import { computed } from "vue";

const { gameInfo } = defineProps({
  gameInfo: Number,
})
const emits = defineEmits(['reloadGame']);

const gameInfoClass = computed(() => {
  return gameInfo === GameStatus.UserWin ? 'modal-win' : 'modal-lost'
})

</script>

<template>
  <div class="overlay">
    <div
        :class="gameInfoClass"
        class="game-end-modal col-10 col-lg-6"
    >
      <div class="modal-content">
        <p v-if="gameInfo === GameStatus.UserWin">Вы победили!</p>
        <p v-else>Вы проиграли <span class="text-nowrap">:(</span></p>
      </div>


      <div class="modal-buttons row row-cols-1 row-cols-lg-2">
        <div class="col-12 col-lg-5">
          <button class="btn btn-dark" @click="$router.push({name: 'main'})"
          >На главную
          </button>
        </div>
        <div class="col-12 col-lg-5">
          <button class="btn btn-dark" @click="emits('reloadGame')"
          >Играть снова
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>


.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Затемнение фона */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000; /* Поместить поверх всего остального контента */
}

.game-end-modal {
  padding: 50px 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  min-height: 60%;
  text-align: center;
  background-color: $background-color;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 50px;

  &.modal-win {
    background-color: green;
  }

  &.modal-lost {
    background-color: red;
  }

  .modal-content {
    font-size: calc(3rem + 1vw);
  }

  .modal-buttons {
    display: flex;
    justify-content: space-around;
    padding: 0 20px;
    gap: 15px;

    button {
      width: 100%;
      padding: 15px;
      font-size: 1.4rem;
    }
  }

}

</style>