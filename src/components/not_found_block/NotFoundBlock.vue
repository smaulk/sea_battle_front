<script setup lang="ts">

</script>

<template>
    <div class="not-found-block">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>Извините, запрашиваемая страница не существует.</p>
    </div>
</template>

<style scoped lang="scss">
.not-found-block {
    display: flex;
    flex-direction: column;
    align-items: center;

    h1 {
    font-size: 8em;
    margin-bottom: 0;
    color: $important-color
}

    h2 {
        font-size: 2em;
        margin-top: 0.5em;
        color: $important-color
    }

    p {
        font-size: 1.2em;
        color: $main-color
    }
}

</style>
