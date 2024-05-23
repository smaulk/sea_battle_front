<script setup lang="ts">
import {GameStatus} from "game/enums/GameStatus";

const {gameInfo} = defineProps({
  gameInfo: Number,
})
const emits = defineEmits(['reloadGame']);

</script>

<template>
  <div class="overlay">
    <div
        class="game-end-modal col-10 col-lg-6"
        :class="gameInfo === GameStatus.UserWin ? 'modal-win' : 'modal-lost'"
    >
      <div class="modal-content">
        <p v-if="gameInfo === GameStatus.UserWin">Вы победили!</p>
        <p v-else>Вы проиграли :(</p>
      </div>


      <div class="modal-buttons row row-cols-1 row-cols-lg-2">
        <div class="col-12 col-lg-5">
          <button class="btn btn-dark" @click="$router.push({name: 'Main'})"
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

<style scoped lang="scss">


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
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  height: 60%;
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
    font-size: 50px;
  }

  .modal-buttons {
    display: flex;
    justify-content: space-around;
    padding: 0 20px;
    gap: 10px;

    button {
      width: 100%;
      height: 50px;
      font-size: 20px;
    }
  }

}

</style>