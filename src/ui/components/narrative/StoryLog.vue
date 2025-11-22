<template>
  <div ref="logContainer" class="flex flex-col gap-3 p-4 h-full overflow-y-auto bg-gray-50 rounded-lg shadow-inner">
    <div
        v-for="entry in logs"
        :key="entry.id"
        class="animate-fade-in-up"
    >
      <!-- 系统消息 -->
      <div v-if="entry.type === 'system'" class="text-xs text-gray-400 text-center">
        {{ entry.text }}
      </div>

      <!-- 对话/剧情 -->
      <div v-else class="flex flex-col">
        <span v-if="entry.type === 'combat'" class="text-red-600 font-bold text-sm">[战斗]</span>
        <p :class="{
          'text-gray-800': entry.type === 'info',
          'text-blue-800 italic': entry.type === 'dialogue',
          'text-red-800': entry.type === 'combat'
        }">
          {{ entry.text }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, watch, nextTick} from 'vue';
import {type LogEntry} from '@/shared/types/ecs.ts';

/**
 * Props for the StoryLog component.
 * @property {LogEntry[]} logs - An array of log entries to display in the story log.
 */
const props = defineProps<{
  logs: LogEntry[]
}>();

/**
 * A ref to the HTML element that serves as the container for the log entries.
 * Used for programmatic scrolling to the bottom of the log.
 */
const logContainer = ref<HTMLElement | null>(null);

/**
 * Watches for changes in the number of log entries and automatically scrolls the log container to the bottom.
 * This ensures that the latest log entries are always visible to the user.
 */
watch(() => props.logs.length, async () => {
  await nextTick();
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
});
</script>

<style scoped>
/* 简单的淡入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}
</style>