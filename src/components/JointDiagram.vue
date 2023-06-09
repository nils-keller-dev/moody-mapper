<template>
  <div class="w-full h-full">
    <div
      ref="paperDiv"
      class="border-2 border-black border-solid bg-[#228be6]"
    />
    <ContextMenu
      :isOpen="isContextMenuOpen"
      :x="contextMenuPosition.x"
      :y="contextMenuPosition.y"
      @click="onContextMenuClick"
      :targetType="contextMenuTargetType"
    />
  </div>
</template>

<script lang="ts" setup>
import { useContextMenu } from "@/composables/contextMenu";
import { useDiagram } from "@/composables/diagram";
import { useElements } from "@/composables/elements";
import { BLANK_FACE_32X16 } from "@/constants/blankFace32x16";
import {
  ContextMenuEvent,
  ContextMenuTarget,
} from "@/constants/enums/ContextMenuEvent";
import { DefaultLink } from "@/elements/DefaultLink";
import { RectangleImage } from "@/elements/RectangleImage";
import { useDiagramStore } from "@/stores/diagram";
import { useEditorStore } from "@/stores/editor";
import { useFacesStore } from "@/stores/faces";
import * as joint from "jointjs";
import { storeToRefs } from "pinia";
import { computed, onMounted, watch } from "vue";
import ContextMenu from "./ContextMenu.vue";

const facesStore = useFacesStore();
const { isOpen, face } = storeToRefs(useEditorStore());
const { graphConfig, isConfigUploaded } = storeToRefs(useDiagramStore());

const { elements, updateElements, switchAllFaces, createElement } =
  useElements();

const {
  isContextMenuOpen,
  contextMenuPosition,
  contextMenuTargetId,
  contextMenuTargetType,
  openContextMenu,
  closeContextMenu,
} = useContextMenu();

const { graph, paper, paperDiv, initializePaper } = useDiagram();

const contextMenuTarget = computed(() =>
  elements.value.find((element) => element.id === contextMenuTargetId.value)
);

const removeLink = (_, linkView: joint.dia.LinkView) => {
  // @ts-ignore
  linkView.model.remove();
  updateGraphConfig();
};

onMounted(() => {
  initializePaper(removeLink);

  paper.value.on("blank:contextmenu", (e: MouseEvent) => {
    openContextMenu(e, ContextMenuTarget.Canvas);
  });

  paper.value.on(
    "blank:pointerdown element:pointerdown link:pointerdown",
    closeContextMenu
  );

  paper.value.on("link:connect link:disconnect", updateGraphConfig);

  paper.value.on("element:pointerdblclick", (el: joint.dia.ElementView) => {
    // @ts-ignore
    editFace(el.model.prop("name"));
  });

  paper.value.on(
    "element:contextmenu",
    (cell: RectangleImage, e: MouseEvent) => {
      // @ts-ignore
      openContextMenu(e, ContextMenuTarget.Node, cell.model.id);
    }
  );

  paper.value.on("link:contextmenu", (cell: DefaultLink, e: MouseEvent) => {
    // @ts-ignore
    openContextMenu(e, ContextMenuTarget.Link, cell.model.id);
  });

  setInterval(switchAllFaces, 1e3);
});

const onGraphConfigChange = () => {
  if (!graphConfig.value || !isConfigUploaded.value) return;

  isConfigUploaded.value = false;
  graph.clear();
  facesStore.faces = [];

  graph.fromJSON(graphConfig.value);

  graphConfig.value.cells.forEach((cell) => {
    if (cell.type === "custom.RectangleImage") {
      facesStore.faces.push({
        name: cell.name,
        images: cell.images,
      });
    }
  });

  updateDiagram();
};

watch(graphConfig, onGraphConfigChange);

const updateGraphConfig = () => {
  graphConfig.value = graph.toJSON();
};

const updateDiagram = () => {
  updateElements(graph);
  updateGraphConfig();
};

const editFace = (faceName: string) => {
  isOpen.value = true;
  face.value = faceName;
};

const onContextMenuClick = (e: ContextMenuEvent) => {
  closeContextMenu();

  switch (e) {
    case ContextMenuEvent.Add:
      addNewFace();
      break;
    case ContextMenuEvent.Edit:
      editFace(contextMenuTarget.value?.prop("name"));
      break;
    case ContextMenuEvent.Delete:
      // TODO deletion of link
      deleteFace();
      break;
    case ContextMenuEvent.Rename:
      renameFace();
      break;
  }
};

const addNewFace = () => {
  const faceName = prompt("Enter face name");
  if (!faceName) return;
  const { x, y } = contextMenuPosition.value;
  createElement(x, y, faceName, Array(2).fill(BLANK_FACE_32X16)).addTo(graph);
  updateDiagram();
};

const deleteFace = () => {
  if (!confirm("Are you sure?")) return;
  contextMenuTarget.value?.remove();
  facesStore.deleteFace(contextMenuTarget.value?.prop("name"));
  updateDiagram();
};

const renameFace = () => {
  const faceName = prompt("Enter new face name");
  if (!faceName) return;
  if (facesStore.faces.find((f) => f.name === faceName)) {
    alert("Face name is invalid");
    return;
  }

  facesStore.renameFace(contextMenuTarget.value?.prop("name"), faceName);
  contextMenuTarget.value?.rename(faceName);
  updateDiagram();
};
</script>
