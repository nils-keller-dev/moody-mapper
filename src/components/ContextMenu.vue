<template>
  <div
    @contextmenu.prevent
    v-show="isOpen"
    class="absolute border-2 border-solid border-black text-black bg-white cursor-pointer"
    :style="style"
  >
    <div
      v-for="event in contextMenuEvents"
      :key="event"
      @click="emit('click', event)"
      class="p-2 hover:bg-[#eee]"
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
