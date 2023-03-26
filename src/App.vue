<template>
  <TheMapper />
  <GenericModal v-model="isOpen">
    <TheEditor />
  </GenericModal>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import GenericModal from "./components/GenericModal.vue";
import TheEditor from "./components/TheEditor.vue";
import TheMapper from "./components/TheMapper.vue";
import { useEditorStore } from "./stores/editor";

const { isOpen } = storeToRefs(useEditorStore());
</script>
