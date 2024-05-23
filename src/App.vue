<script setup lang="ts">

import Header from "./components/header/Header.vue";

</script>

<template>
    <Header/>

    <RouterView
        class="container-fluid flex-grow-1 pb-3"
        v-slot="{ Component }"
    >
        <transition name="fade-slide" mode="out-in">
            <component
                :is="Component"
            />
        </transition>
    </RouterView>

</template>

<style scoped lang="scss">


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
