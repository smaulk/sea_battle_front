<script lang="ts" setup>
import AppHeader from "components/AppHeader.vue";
</script>

<template>
  <AppHeader/>

  <RouterView
      v-slot="{ Component }"
      class="container-fluid flex-grow-1 pb-3"
  >
    <transition mode="out-in" name="fade-slide">
      <component
          :is="Component"
      />
    </transition>
  </RouterView>
</template>

<style lang="scss" scoped>
</style>
