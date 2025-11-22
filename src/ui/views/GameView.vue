<template>
  <div class="h-screen flex flex-col max-w-2xl mx-auto border-x border-gray-300 bg-white">
    <!-- 1. 顶部信息 -->
    <CurrentState
        :room-desc="currentRoomShortDesc"
        :room-name="currentRoomName"
        :turn="store.latestSnapshot?.tick || 0"
    />

    <!-- 2. 核心文字区域 (自适应高度) -->
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

const store = useGameWorkerStore();

// --- 数据计算逻辑 (Helpers) ---
// 实际项目中这些逻辑建议移到 Store 的 Getters 里

// 1. 获取玩家实体
const playerEntity = computed(() => {
  return store.latestSnapshot?.entities.find(e => e.tags.includes('Player'));
});

// 2. 获取当前房间 (通过标签或玩家的位置组件引用，这里简化用 Tag)
const roomEntity = computed(() => {
  return store.latestSnapshot?.entities.find(e => e.tags.includes('CurrentRoom'));
});

// 3. 提取剧情日志
const narrativeLogs = computed(() => {
  const comp = playerEntity.value?.components[ComponentType.NarrativeLog] as INarrativeLogComponent;
  return comp?.history || [];
});

// 4. 提取当前选项
const currentChoices = computed(() => {
  const comp = playerEntity.value?.components[ComponentType.ChoiceList] as IChoiceListComponent;
  return comp?.choices || [];
});

// 5. 提取房间信息
const currentRoomName = computed(() => {
  const comp = roomEntity.value?.components[ComponentType.BaseInfo] as IBaseInfoComponent;
  return comp?.name || 'Unknown Area';
});

const currentRoomShortDesc = computed(() => {
  const comp = roomEntity.value?.components[ComponentType.Description] as IDescriptionComponent;
  return comp?.short || '...';
});

// --- 交互逻辑 ---

const handleChoice = (choice: ChoiceAction) => {
  console.log('Player selected:', choice.label);
  // 发送指令给 Worker
  store.sendPlayerInput(choice.actionType, {choiceId: choice.id});
};
</script>