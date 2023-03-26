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
    <GoDiagram />
  </div>
</template>

<script setup lang="ts">
import { useMapping } from "@/composables/mapping";
import type { LinkData } from "@/constants/interfaces/LinkData";
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
  displayNodes();
  await importConfig();
};

const importConfig = async () => {
  if (!filesStore.configuration) {
    return false;
  }

  const fr = new FileReader();

  fr.onload = (e) => {
    const configData = JSON.parse(e.target?.result as string);
    const modelData = JSON.parse(model.value?.toJson() || "{}");

    modelData.linkDataArray = JSON.parse(
      JSON.stringify(configData.linkDataArray)
    );

    modelData.nodeDataArray.forEach((node: NodeData) => {
      const nodeFromConfig = configData.nodeDataArray.find(
        (n: NodeData) => node.name === n.name
      ) as NodeData;

      if (nodeFromConfig) {
        node.loc = nodeFromConfig.loc;

        if (nodeFromConfig.key !== node.key) {
          modelData.linkDataArray.forEach((link: LinkData, index: number) => {
            const linkFromConfig = configData.linkDataArray[index];

            if (linkFromConfig.from === nodeFromConfig.key) {
              link.from = node.key;
            }

            if (linkFromConfig.to === nodeFromConfig.key) {
              link.to = node.key;
            }
          });
        }
      }
    });

    model.value = go.Model.fromJson(JSON.stringify(modelData));
  };

  fr.readAsText(await filesStore.configuration.getFile());
};

const displayNodes = () => {
  const faceNodes = facesStore.faces.map((face, index) => ({
    key: index,
    images: face.images,
    text: `${index} - ${face.name}`,
    name: face.name,
  }));

  model.value = new go.GraphLinksModel(faceNodes, []);
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
</script>
