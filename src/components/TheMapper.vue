<template>
  <div class="flex flex-col items-center gap-2.5 h-full">
    <div class="flex gap-2.5">
      <BaseButton
        tooltip="Import"
        icon="fa-file-lines"
        @click="onClickImport"
      />
      <div class="h-auto border-l-2 border-dashed border-black"></div>
      <BaseButton tooltip="Save" icon="fa-save" @click="onClickSave" />
    </div>
    <GoDiagram @facesChange="refreshNodes" />
  </div>
</template>

<script setup lang="ts">
import { useMapping } from "@/composables/mapping";
import type { NodeData } from "@/constants/interfaces/NodeData";
import { useDiagramStore } from "@/stores/diagram";
import { useFacesStore } from "@/stores/faces";
import { useFilesStore } from "@/stores/files";
import go from "gojs";
import { storeToRefs } from "pinia";
import BaseButton from "./BaseButton.vue";
import GoDiagram from "./GoDiagram.vue";

const facesStore = useFacesStore();
const { model } = storeToRefs(useDiagramStore());
const { generateConfigFile: generateArduinoConfig } = useMapping();
const filesStore = useFilesStore();

const onClickImport = async () => {
  let dirHandle;
  try {
    dirHandle = await (window as any).showDirectoryPicker();
  } catch {
    console.log("Please select a directory");
    return;
  }

  await filesStore.fillStore(dirHandle);
  await facesStore.fillFaces(filesStore.faces);
  await importConfig();
};

const importConfig = async () => {
  if (!filesStore.configuration) {
    return false;
  }

  const fr = new FileReader();

  fr.onload = (e) => {
    const configData = JSON.parse(e.target?.result as string);

    configData.nodeDataArray = configData.nodeDataArray.filter(
      (node: NodeData) => filesStore.faces[node.name]
    );

    model.value = new go.GraphLinksModel(
      configData.nodeDataArray,
      configData.linkDataArray
    );

    loadFacesFromStore();
  };

  fr.readAsText(await filesStore.configuration.getFile());
};

const loadFacesFromStore = () => {
  facesStore.faces.forEach((face, index) => {
    const node = model.value?.nodeDataArray.find((n) => n.name === face.name);

    model.value?.commit((d) => {
      if (node) {
        d.setDataProperty(node, "images", face.images);
        d.setKeyForNodeData(node, index);
      } else {
        facesStore.faces.slice(index + 1).forEach((_face, i) => {
          const currentFaceIndex = facesStore.faces.length - i - 1;
          const node = model.value?.findNodeDataForKey(currentFaceIndex - 1);

          if (node) {
            d.setKeyForNodeData(node, currentFaceIndex);
          }
        });

        d.addNodeData({
          key: index,
          images: face.images,
          name: face.name,
        });
      }
    }, `update node data for ${face.name}}`);
  });
};

const refreshNodes = async (countChanged = false) => {
  if (countChanged) await filesStore.loadFaces();

  await facesStore.fillFaces(filesStore.faces);

  loadFacesFromStore();
};

const onClickSave = async () => {
  if (!filesStore.arduinoFile || !filesStore.configuration) {
    window.alert("Please select a directory");
    return;
  }

  writeFile(filesStore.arduinoFile, generateArduinoConfig());
  writeFile(filesStore.configuration, generateConfiguration());
};

const generateConfiguration = () => {
  const data = JSON.parse((model.value as go.Model).toJson());
  const nodeDataArray = data.nodeDataArray.map((node: NodeData) => ({
    ...node,
    images: undefined,
  }));

  data.nodeDataArray = nodeDataArray;

  return JSON.stringify(data, null, 2);
};

const writeFile = async (
  // eslint-disable-next-line no-undef
  fileHandle: FileSystemFileHandle,
  contents: string
) => {
  //@ts-ignore
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
};

defineExpose({ refreshNodes });
</script>
