<template>
  <div
    v-if="modelValue"
    class="absolute top-0 bottom-0 left-0 right-0 w-3/4 h-fit z-50 m-auto p-4 pt-8 rounded-lg bg-blue-900"
  >
    <font-awesome-icon
      icon="fa-solid fa-xmark"
      @click="emit('update:modelValue', false)"
      class="w-6 h-6 m-2 text-xl text-white cursor-pointer absolute top-0 right-0"
    />
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);
</script>
