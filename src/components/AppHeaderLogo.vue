<script lang="ts" setup>
const { img } = defineProps({
  img: String,
});
</script>

<template>
  <div class="header-logo">
    <img
        :src="img"
        alt=""
        class="not-highlight"
        @click="$router.push({name: 'Main'})"
    >
  </div>
</template>

<style lang="scss" scoped>
.header-logo {
  cursor: pointer;
  height: 80px;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
