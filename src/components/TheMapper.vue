<template>
  <div class="flex flex-col items-center gap-2.5 h-full">
    <div class="flex gap-2.5">
      <BaseButton
        tooltip="Import"
        icon="fa-file-lines"
        @click="fileInput?.click()"
      />
      <input
        class="hidden"
        ref="fileInput"
        type="file"
        @change="onClickImport"
        accept="application/JSON"
      />
      <div class="h-auto border-l-2 border-dashed border-black"></div>
      <BaseButton tooltip="Save" icon="fa-save" @click="onClickSave" />
    </div>
    <JointDiagram />
  </div>
</template>

<script setup lang="ts">
// import { useMapping } from "@/composables/mapping";
import { useDiagramStore } from "@/stores/diagram";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import BaseButton from "./BaseButton.vue";
import JointDiagram from "./JointDiagram.vue";

const fileInput = ref<HTMLInputElement | null>(null);

const { graphConfig } = storeToRefs(useDiagramStore());
// const { generateConfigFile: generateArduinoConfig, generateArduinoFaces } =
//   useMapping();

const onClickImport = async () => {
  if (!fileInput.value) return;
  if (fileInput.value.files?.length === 1) {
    const reader = new FileReader();
    reader.onload = () => {
      graphConfig.value = reader.result as string;
    };
    reader.readAsText(fileInput.value.files[0]);
  }
  fileInput.value.value = "";
};

const onClickSave = async () => {
  // TODO Download files as zip (arduino files + config.json + readme)
};
</script>
