<template>
  <button @click="onClick" :title="tooltip">
    <font-awesome-icon :icon="`fa-solid ${icon}`" />
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  tooltip: string;
  icon: string;
}>();

const emit = defineEmits(["click"]);

const onClick = () => {
  emit("click");
};
</script>

<style scoped>
button {
  width: 40px;
  height: 40px;
  font-size: 20px;
  border: none;
  background-color: #4287f5;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}
</style>
