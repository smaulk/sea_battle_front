<script setup lang="ts">

const {img} = defineProps({
   img: String,
});


</script>

<template>
    <div class="header-logo">
        <img
            @click="$router.push({name: 'Main'})"
            :src="img"
            alt=""
            class="not-highlight"
        >
    </div>
</template>

<style scoped lang="scss">
.header-logo {
    cursor: pointer;
    height: 80px;

    img {
        width: 100%;
        height: 100%;
    }
}
</style>
