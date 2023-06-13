<template>
  <button
    @click="emit('click')"
    :title="tooltip"
    :class="`w-10 h-10 text-xl border-0 cursor-pointer ${style}`"
  >
    <font-awesome-icon :icon="`fa-solid ${icon}`" />
  </button>
</template>

<script lang="ts" setup>
import { ButtonType } from "@/constants/enums/ButtonType";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tooltip: string;
    icon: string;
    type?: ButtonType;
  }>(),
  {
    type: ButtonType.Default,
  }
);

const emit = defineEmits(["click"]);

const style = computed(() => {
  return props.type === ButtonType.Default
    ? "bg-[#4287f5] text-white rounded"
    : "bg-white text-[#161616] hover:bg-neutral-200";
});
</script>
