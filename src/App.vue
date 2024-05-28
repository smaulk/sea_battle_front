<script lang="ts" setup>
import Header from "@/components/header/Header.vue";
</script>

<template>
  <Header/>

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


.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
