<template>
  <GameDebug/>
  <GameView/>
</template>

/**
 * App.vue
 * Main application component that orchestrates the display of game debugging tools and the primary game view.
 * It imports and renders the GameDebug and GameView components.
 */
<script lang="ts" setup>
import GameDebug from '@/ui/views/GameDebug.vue';
import GameView from "@/ui/views/GameView.vue";
</script>

<style>
/* 全局重置或基础样式 */
body {
  margin: 0;
  font-family: sans-serif;
}
</style>