<template>
  <div class="bg-gray-800 text-white p-3 shadow-md flex justify-between items-center">
    <div>
      <h2 class="font-bold text-lg">{{ roomName }}</h2>
      <p class="text-xs text-gray-400">{{ roomDesc }}</p>
    </div>
    <div class="text-xs bg-gray-700 px-2 py-1 rounded">
      Turn: {{ turn }}
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  roomName: string,
  roomDesc: string,
  turn: number
}>();
</script>