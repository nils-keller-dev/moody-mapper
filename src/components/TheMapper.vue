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

        updateLinkDataArray(
          configData.linkDataArray,
          modelData.linkDataArray,
          nodeFromConfig.key,
          node.key
        );
      }
    });

    model.value = go.Model.fromJson(JSON.stringify(modelData));
  };

  fr.readAsText(await filesStore.configuration.getFile());
};

const updateLinkDataArray = (
  oldLinkData: Array<LinkData>,
  newLinkData: Array<LinkData>,
  oldKey: number,
  newKey: number
) => {
  if (oldKey === newKey) return;

  newLinkData.forEach((link: LinkData, index: number) => {
    const oldLink = oldLinkData[index];

    if (oldLink.from === oldKey) {
      link.from = newKey;
    }

    if (oldLink.to === oldKey) {
      link.to = newKey;
    }
  });
};

const refreshNodes = async (countChanged = false) => {
  if (countChanged) await filesStore.loadFaces();

  await facesStore.fillFaces(filesStore.faces);

  facesStore.faces.forEach((face, index) => {
    const newNode = model.value?.nodeDataArray.find(
      (n) => n.name === face.name
    );

    model.value?.commit((d) => {
      if (newNode) {
        d.setDataProperty(newNode, "images", face.images);
        d.setKeyForNodeData(newNode, index);
      } else {
        d.addNodeData(getFaceNode(face, index));
      }
    }, `refresh node data for ${face.name}}`);
  });
};

const getFaceNode = (
  face: {
    name: string;
    images: string[];
  },
  index: number
) => ({
  key: index,
  images: face.images,
  text: face.name,
  name: face.name,
});

const displayNodes = () => {
  const faceNodes = facesStore.faces.map(getFaceNode);

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

defineExpose({ refreshNodes });
</script>
