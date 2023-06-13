<template>
  <div class="flex flex-col items-center gap-2.5 h-full">
    <MenuOverlay class="top-5 left-5">
      <BaseButton
        :type="ButtonType.Overlay"
        tooltip="Import"
        icon="fa-file-arrow-up"
        @click="fileInput?.click()"
      />
      <input
        class="hidden"
        ref="fileInput"
        type="file"
        @change="onClickImport"
        accept="application/JSON"
      />
      <BaseButton
        :type="ButtonType.Overlay"
        tooltip="Save"
        icon="fa-save"
        @click="onClickSave"
      />
    </MenuOverlay>
    <JointDiagram />
  </div>
</template>

<script setup lang="ts">
import { useFile } from "@/composables/file";
import { useMapping } from "@/composables/mapping";
import { ButtonType } from "@/constants/enums/ButtonType";
import { useDiagramStore } from "@/stores/diagram";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import BaseButton from "./BaseButton.vue";
import JointDiagram from "./JointDiagram.vue";
import MenuOverlay from "./MenuOverlay.vue";

const fileInput = ref<HTMLInputElement | null>(null);

const { graphConfig, isConfigUploaded } = storeToRefs(useDiagramStore());
const { generateConfigFile, generateArduinoFaces } = useMapping();
const { generateAndDownloadZip } = useFile();

const onClickImport = async () => {
  if (!fileInput.value) return;
  if (fileInput.value.files?.length === 1) {
    isConfigUploaded.value = true;
    const reader = new FileReader();
    reader.onload = () => {
      graphConfig.value = JSON.parse(reader.result as string);
    };
    reader.readAsText(fileInput.value.files[0]);
  }
  fileInput.value.value = "";
};

const onClickSave = async () => {
  const arduinoFaces = await generateArduinoFaces();
  const config = await generateConfigFile();

  generateAndDownloadZip([
    {
      name: "moody/faces.h",
      contents: arduinoFaces,
    },
    {
      name: "moody/facesConfig.h",
      contents: config,
    },
    {
      name: "facesConfig.json",
      contents: JSON.stringify(graphConfig.value, null, 2),
    },
  ]);
};
</script>
