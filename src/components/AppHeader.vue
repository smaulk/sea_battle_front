<script lang="ts" setup>
import { header_logo } from '@/config.ts';
import AppHeaderLogo from "./AppHeaderLogo.vue";
</script>

<template>
  <nav class="navbar navbar-expand-lg not-highlight">
    <div class="container-fluid justify-content-between">
      <AppHeaderLogo
          :img="header_logo"
          class="navbar-brand"
      />
    </div>
  </nav>
</template>

<style lang="scss" scoped>
</style>
