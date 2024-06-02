<script lang="ts" setup>
import { DifficultyLevel, DifficultyLevelRU } from "@/enums/DifficultyLevel.ts";
</script>

<template>
  <div class="d-flex flex-column align-items-center py-3 gap-4">
    <div class="mb-5">
      <p class="h1 text-center">Играть в морской бой</p>
    </div>

    <div class="col-12 d-flex flex-column">
      <div class="d-flex justify-content-center pt-3">
        <p class="h3">Выберите уровень сложности</p>
      </div>

      <div class="d-flex align-items-center justify-content-around">
        <div class="difficulty-btns col-10 col-sm-8 col-lg-6 col-xl-4 d-flex flex-column align-items-center gap-3">
          <button
              class="btn-u"
              @click="$router.push({name: 'game', query: {difficulty: DifficultyLevel.Easy}})"
          >
            {{ DifficultyLevelRU[DifficultyLevel.Easy] }}
          </button>
          <button
              class="btn-u"
              @click="$router.push({name: 'game', query: {difficulty: DifficultyLevel.Normal}})"
          >
            {{ DifficultyLevelRU[DifficultyLevel.Normal] }}
          </button>
        </div>
      </div>
    </div>
    <a class="h4 text-center link link-warning"
       href="https://ru.wikipedia.org/wiki/%D0%9C%D0%BE%D1%80%D1%81%D0%BA%D0%BE%D0%B9_%D0%B1%D0%BE%D0%B9_(%D0%B8%D0%B3%D1%80%D0%B0)"
       target="_blank">
      Информация об игре
    </a>
  </div>
</template>

<style lang="scss" scoped>
.difficulty-btns {
  button {
    font-size: calc(1.6rem + 0.4vw);
    padding: 10px;
  }
}
</style>
