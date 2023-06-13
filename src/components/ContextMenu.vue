<template>
  <div
    @contextmenu.prevent
    v-show="isOpen"
    class="py-1 absolute border border-solid rounded shadow-md border-neutral-500 text-black bg-white cursor-pointer overflow-hidden"
    :style="style"
  >
    <div
      v-for="event in contextMenuEvents"
      :key="event"
      @click="emit('click', event)"
      class="px-4 py-1 hover:bg-[#228be6] hover:text-white"
    >
      {{ event }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ContextMenuEvent } from "@/constants/enums/ContextMenuEvent";
import {
  ContextMenuTarget,
  contextMenuEventMap,
} from "@/constants/enums/ContextMenuEvent";
import { computed } from "vue";

const props = defineProps<{
  x: number;
  y: number;
  isOpen: boolean;
  targetType: ContextMenuTarget;
}>();

const contextMenuEvents = computed(() => contextMenuEventMap[props.targetType]);

const emit = defineEmits<{
  (e: "click", event: ContextMenuEvent): void;
}>();

const style = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}));
</script>
