<template>
  <!-- 这个 div 将作为 Phaser 的容器 -->
  <div id="phaser-game-container" class="w-full h-full"></div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted} from 'vue';
/**
 * Imports the function to launch the Phaser game.
 * @see {@link launchGame} for details on game initialization.
 */
import {launchGame} from '@/game/launch';
import type Phaser from 'phaser';

/**
 * Stores the Phaser game instance once it's launched.
 * It is initialized to `null` and assigned a value in `onMounted`.
 */
let gameInstance: Phaser.Game | null = null;

/**
 * Lifecycle hook that runs after the component is mounted to the DOM.
 * It initializes and launches the Phaser game within the specified container.
 */
onMounted(() => {
  // 启动 Phaser
  // 确保 DOM 已经渲染完毕
  gameInstance = launchGame('phaser-game-container');
});

/**
 * Lifecycle hook that runs before the component is unmounted from the DOM.
 * It destroys the Phaser game instance to free up resources.
 */
onUnmounted(() => {
  // 销毁游戏实例
  if (gameInstance) {
    gameInstance.destroy(true); // true = remove canvas
    gameInstance = null;
  }
});
</script>

<style scoped>
/* 确保容器占满空间 */
#phaser-game-container {
  overflow: hidden;
  background-color: black;
}
</style>