<template>
  <div class="grid grid-cols-2 gap-2 p-2 bg-white border-t border-gray-200">
    <button
        v-for="choice in choices"
        :key="choice.id"
        class="
        px-4 py-3
        text-sm font-medium text-gray-700
        bg-white border border-gray-300 rounded-md shadow-sm
        hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300
        active:bg-blue-100 active:translate-y-0.5
        transition-all duration-200
      "
        @click="emit('select', choice)"
    >
      {{ choice.label }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import {type ChoiceAction} from '@/shared/types/ecs.ts';

defineProps<{
  choices: ChoiceAction[]
}>();

const emit = defineEmits<{
  (e: 'select', choice: ChoiceAction): void
}>();
</script>