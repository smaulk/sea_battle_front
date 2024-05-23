<script setup lang="ts">
import {header_logo} from '@/config.ts';
import HeaderLogo from "./HeaderLogo.vue";


</script>

<template>
    <nav class="navbar navbar-expand-lg not-highlight">
        <div class="container-fluid justify-content-between">
            <HeaderLogo
                class="navbar-brand"
                :img="header_logo"
            />
        </div>
    </nav>

</template>

<style scoped lang="scss">

</style>
