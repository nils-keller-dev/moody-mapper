<template>
  <button
    @click="emit('click')"
    :title="tooltip"
    class="w-10 h-10 text-xl border-0 bg-[#4287f5] text-white rounded cursor-pointer"
  >
    <font-awesome-icon :icon="`fa-solid ${icon}`" />
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  tooltip: string;
  icon: string;
}>();

const emit = defineEmits(["click"]);
</script>
