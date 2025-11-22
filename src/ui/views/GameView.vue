<!-- src/ui/views/GameView.vue 修改后 -->
<template>
  <div class="h-screen flex flex-col bg-gray-900 text-white">

    <!-- 上半部分：Phaser 游戏视口 (高度 40%) -->
    <div class="h-2/5 relative border-b border-gray-700">
      <GameCanvas/>

      <!-- 可以在 Phaser 之上覆盖一层 Vue UI (HUD) -->
      <div class="absolute top-2 left-2 bg-black/50 p-2 rounded text-xs">
        Visual Layer
      </div>
    </div>

    <!-- 下半部分：文字剧情交互区 (高度 60%) -->
    <div class="h-3/5 flex flex-col bg-white text-gray-900">
      <!-- 1. 顶部信息 -->
      <CurrentState
          :room-desc="currentRoomShortDesc"
          :room-name="currentRoomName"
          :turn="store.latestSnapshot?.tick || 0"
      />

      <!-- 2. 核心文字区域 -->
      <div class="flex-1 overflow-hidden relative">
        <StoryLog :logs="narrativeLogs"/>
      </div>

      <!-- 3. 底部选项区域 -->
      <div class="shrink-0">
        <ChoicePanel
            :choices="currentChoices"
            @select="handleChoice"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useGameWorkerStore} from '@/ui/stores/gameWorker';
import type {
  IBaseInfoComponent,
  IDescriptionComponent,
  INarrativeLogComponent,
  IChoiceListComponent,
  ChoiceAction
} from '@/shared/types/ecs';
import {ComponentType} from '@/shared/types/ecs.ts'

// 引入组件
import CurrentState from '../components/narrative/CurrentState.vue';
import StoryLog from '../components/narrative/StoryLog.vue';
import ChoicePanel from '../components/narrative/ChoicePanel.vue';
import GameCanvas from "@/ui/components/GameCanvas.vue";

const store = useGameWorkerStore();

// --- 数据计算逻辑 (Helpers) ---
// 实际项目中这些逻辑建议移到 Store 的 Getters 里

/**
 * Computed property that returns the player entity from the latest world snapshot.
 * The player entity is identified by the 'Player' tag.
 */
const playerEntity = computed(() => {
  return store.latestSnapshot?.entities.find(e => e.tags.includes('Player'));
});

/**
 * Computed property that returns the current room entity from the latest world snapshot.
 * The room entity is identified by the 'CurrentRoom' tag.
 */
const roomEntity = computed(() => {
  return store.latestSnapshot?.entities.find(e => e.tags.includes('CurrentRoom'));
});

/**
 * Computed property that extracts narrative log entries from the player entity.
 * Returns an array of LogEntry objects, or an empty array if no logs are found.
 */
const narrativeLogs = computed(() => {
  const comp = playerEntity.value?.components[ComponentType.NarrativeLog] as INarrativeLogComponent;
  return comp?.history || [];
});

/**
 * Computed property that extracts available choice actions from the player entity.
 * Returns an array of ChoiceAction objects, or an empty array if no choices are available.
 */
const currentChoices = computed(() => {
  const comp = playerEntity.value?.components[ComponentType.ChoiceList] as IChoiceListComponent;
  return comp?.choices || [];
});

/**
 * Computed property that returns the name of the current room.
 * Extracts the name from the BaseInfoComponent of the room entity.
 * Defaults to 'Unknown Area' if the room entity or component is not found.
 */
const currentRoomName = computed(() => {
  const comp = roomEntity.value?.components[ComponentType.BaseInfo] as IBaseInfoComponent;
  return comp?.name || 'Unknown Area';
});

/**
 * Computed property that returns a short description of the current room.
 * Extracts the short description from the DescriptionComponent of the room entity.
 * Defaults to '...' if the room entity or component is not found.
 */
const currentRoomShortDesc = computed(() => {
  const comp = roomEntity.value?.components[ComponentType.Description] as IDescriptionComponent;
  return comp?.short || '...';
});

// --- 交互逻辑 ---

/**
 * Handles the selection of a choice by the player.
 * Sends a player input message to the game worker with the selected choice's action type and ID.
 * @param choice The ChoiceAction object representing the player's selection.
 */
const handleChoice = (choice: ChoiceAction) => {
  console.log('Player selected:', choice.label);
  // 发送指令给 Worker
  store.sendPlayerInput(choice.actionType, {choiceId: choice.id});
};
</script>