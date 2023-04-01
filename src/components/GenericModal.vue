<template>
  <Transition>
    <div
      v-if="modelValue"
      @click="close"
      class="absolute w-full h-full top-0 left-0 z-40 bg-[#00000088]"
    />
  </Transition>
  <Transition>
    <div
      v-if="modelValue"
      class="absolute top-0 bottom-0 left-0 right-0 w-3/4 h-fit z-50 m-auto p-4 pt-8 rounded-lg bg-blue-900"
    >
      <font-awesome-icon
        icon="fa-solid fa-xmark"
        @click="close"
        class="w-6 h-6 m-2 text-xl text-white cursor-pointer absolute top-0 right-0"
      />
      <slot />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const close = () => {
  emit("update:modelValue", false);
};
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.15s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
