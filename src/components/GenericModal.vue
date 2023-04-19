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
      class="absolute top-0 bottom-0 left-0 right-0 w-3/4 h-fit z-50 m-auto p-4 rounded-lg bg-blue-900"
      :class="{
        'pt-10': isClosable,
      }"
    >
      <font-awesome-icon
        v-if="isClosable"
        icon="fa-solid fa-xmark"
        @click="close"
        class="w-6 h-6 m-2 text-xl text-white cursor-pointer absolute top-0 right-0"
      />
      <slot />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    isClosable?: boolean;
  }>(),
  {
    isClosable: true,
  }
);

const emit = defineEmits(["update:modelValue"]);

const close = () => {
  if (!props.isClosable) return;
  emit("update:modelValue", false);
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    close();
  }
};

document.addEventListener("keydown", onKeyDown);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeyDown);
});
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
