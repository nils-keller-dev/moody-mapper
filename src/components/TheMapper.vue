<template>
  <div class="main">
    <input
      ref="fileInput"
      type="file"
      @change="onChangeImageUpload"
      webkitdirectory
      directory
      multiple
    />
    <input
      ref="importInput"
      type="file"
      @change="onChangeImport"
      accept="application/json"
    />
    <div class="buttonWrapper">
      <BaseButton
        tooltip="tooltip"
        icon="fa-images"
        @click="fileInput?.click()"
      />
      <BaseButton
        tooltip="tooltip"
        icon="fa-file-lines"
        @click="importInput?.click()"
      />
      <div class="verticalLine"></div>
      <BaseButton
        tooltip="tooltip"
        icon="fa-infinity"
        @click="onClickSaveArduino"
      />
      <BaseButton
        tooltip="tooltip"
        icon="fa-save"
        @click="onClickSaveConfiguration"
      />
    </div>
    <GoDiagram />
  </div>
</template>

<script setup lang="ts">
import { useMapping } from "@/composables/mapping";
import { useDiagramStore } from "@/stores/diagram";
import { useFacesStore } from "@/stores/faces";
import { download } from "@/utils/download";
import go from "gojs";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import BaseButton from "./BaseButton.vue";
import GoDiagram from "./GoDiagram.vue";

const fileInput = ref<HTMLInputElement | null>(null);
const importInput = ref<HTMLInputElement | null>(null);

const facesStore = useFacesStore();
const { model } = storeToRefs(useDiagramStore());
const { generateConfigFile } = useMapping();

const onChangeImageUpload = () => {
  if (fileInput.value) {
    if (fileInput.value.files?.length) {
      facesStore.fillFaces(fileInput.value.files);
      displayNodes();
    }
    fileInput.value.value = "";
  }
};

const onChangeImport = () => {
  if (!importInput.value) {
    return false;
  }

  if (!facesStore.faces.length) {
    window.alert("Please upload images first");
    importInput.value.value = "";
    return false;
  }

  const files = importInput.value.files;
  const fr = new FileReader();

  fr.onload = (e) => {
    const rawData = JSON.parse(e.target?.result as string);
    const facesArrayObject = facesStore.faces.reduce(
      (previous: any, current: any) => {
        previous[current.name] = current.images;
        return previous;
      },
      {}
    );

    Object.entries(rawData.nodeDataArray).forEach((entry: any) => {
      const [key, node] = entry;
      if (facesArrayObject[node.name]) {
        node.images = facesArrayObject[node.name];
      } else {
        delete rawData.nodeDataArray[key];
        rawData.nodeDataArray.length--;
      }
    });

    model.value = go.Model.fromJson(JSON.stringify(rawData));

    if (importInput.value) {
      importInput.value.value = "";
    }
  };

  fr.readAsText(files?.item(0) as Blob);
};

const displayNodes = () => {
  const faceNodes = facesStore.faces.map((face: any, index) => ({
    key: index,
    images: face.images,
    text: `${index} - ${face.name}`,
    name: face.name,
  }));

  model.value = new go.GraphLinksModel(faceNodes, []);
};

const onClickSaveArduino = () => {
  if (!facesStore.faces) {
    window.alert("No faces to export");
    return;
  }
  download("facesConfig.h", generateConfigFile());
};

const onClickSaveConfiguration = () => {
  const data = JSON.parse((model.value as any).toJson());
  const nodeDataArray = data.nodeDataArray.map(({ images, ...item }) => item);
  data.nodeDataArray = nodeDataArray;

  download("facesConfig.json", JSON.stringify(data));
};
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  height: 100%;
}

.buttonWrapper {
  display: flex;
  gap: 10px;
}

input {
  display: none;
}

.verticalLine {
  border-left: 2px dashed black;
  height: auto;
}
</style>
