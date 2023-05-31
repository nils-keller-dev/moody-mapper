<template>
  <div
    @contextmenu.prevent
    v-show="isOpen"
    class="absolute border-2 border-solid border-black text-black bg-white cursor-pointer"
    :style="style"
  >
    <div
      @click="emit('click', ContextMenuEvent.ADD)"
      class="p-2 hover:bg-[#eee]"
    >
      Add new face
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ContextMenuEvent } from "@/constants/enums/ContextMenuEvent";
import { computed } from "vue";

const props = defineProps<{
  x: number;
  y: number;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "click", event: ContextMenuEvent): void;
}>();

const style = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
}));
</script>
