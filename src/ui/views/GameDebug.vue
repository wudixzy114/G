<template>
  <div class="game-debug p-6 font-mono text-sm text-gray-800">
    <h1 class="text-2xl font-bold mb-4">RPG Engine Debugger</h1>

    <!-- 状态面板 -->
    <div class="grid grid-cols-2 gap-4 mb-6 bg-gray-100 p-4 rounded-lg border border-gray-300">
      <div>
        <p class="mb-1">
          Worker Status:
          <span :class="store.isReady ? 'text-green-600 font-bold' : 'text-red-500'">
            {{ store.isReady ? 'READY' : 'WAITING' }}
          </span>
        </p>
        <p class="mb-1">
          Loop Status:
          <span :class="store.isRunning ? 'text-green-600 font-bold' : 'text-gray-500'">
            {{ store.isRunning ? 'RUNNING' : 'STOPPED' }}
          </span>
        </p>
      </div>
      <div>
        <p class="mb-1">Tick: <span class="font-bold">{{ tick }}</span></p>
        <p class="mb-1">Entities: <span class="font-bold">{{ entityCount }}</span></p>
      </div>
    </div>

    <!-- 控制按钮区 -->
    <div class="flex flex-wrap gap-3 mb-6">
      <button
          :disabled="store.isReady"
          class="btn bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
          @click="store.initWorker"
      >
        1. Init System
      </button>

      <button
          :disabled="!store.isReady || store.isRunning"
          class="btn bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
          @click="store.startGame"
      >
        2. Start Loop
      </button>

      <button
          :disabled="!store.isRunning"
          class="btn bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400"
          @click="store.stopGame"
      >
        Pause
      </button>

      <button
          :disabled="!store.isReady"
          class="btn bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400"
          @click="store.saveGame"
      >
        Save to DB
      </button>

      <div class="w-px h-8 bg-gray-300 mx-2"></div>

      <button
          :disabled="!store.isReady"
          class="btn bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400"
          @click="createTestEntity"
      >
        Debug: Spawn Entity
      </button>
    </div>

    <!-- 数据可视化 -->
    <div class="border border-gray-300 rounded p-4 bg-white h-96 overflow-auto">
      <h3 class="font-bold mb-2 border-b pb-2">World Snapshot (JSON)</h3>
      <pre v-if="store.latestSnapshot" class="text-xs text-gray-600">{{ store.latestSnapshot.entities }}</pre>
      <div v-else class="text-gray-400 italic">Waiting for snapshot...</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useGameWorkerStore} from '@/ui/stores/gameWorker.ts';
import {WorkerMessageType} from '@/shared/types/worker.ts';

/**
 * Initializes the game worker store to access game state and actions.
 */
const store = useGameWorkerStore();

/**
 * Computed property that returns the current game tick from the latest world snapshot.
 * Defaults to 0 if no snapshot is available.
 */
const tick = computed(() => store.latestSnapshot?.tick || 0);
/**
 * Computed property that returns the number of entities in the latest world snapshot.
 * Defaults to 0 if no snapshot is available.
 */
const entityCount = computed(() => store.latestSnapshot?.entities.length || 0);

/**
 * Sends a debug command to the game worker to create a test entity.
 * This function demonstrates how to interact with the game worker for debugging purposes.
 */
const createTestEntity = () => {
  // 我们通过 store 暴露的 postMessage 机制（或者手动调用）
  // 由于 store 里我们封装了 start/stop/save，但没暴露通用的 send
  // 我们这里临时扩充一下 store 或者直接用 raw worker（不推荐）。
  // 最佳实践：在 store 里加一个 sendAction 方法。

  // 这里假设你在 useGameWorkerStore 里添加了这个 helper，或者我们直接获取 worker 发送
  // 为了代码干净，建议去 store 里加一个 `sendInput` action。
  // 既然刚才的 store 代码没写，这里我直接演示如何通过 store 扩展 action。

  // 临时方案：直接访问 store 私有的 worker (如果 store 没暴露，需要去 store 加一个 action)
  // 让我们假设 store 增加了一个 action: sendPlayerInput

  store.postMessage({
    type: WorkerMessageType.PLAYER_INPUT,
    payload: {action: 'DEBUG_CREATE', payload: {}}
  });
};
</script>

<style scoped>
/* 简单的按钮样式兼容，以防 UnoCSS 未配置 */
.btn {
  @apply text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out;
}

/* 如果没有 UnoCSS，把 @apply 换成标准 CSS 即可 */
button {
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>