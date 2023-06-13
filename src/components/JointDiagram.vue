<template>
  <div class="w-full h-full">
    <div ref="paperDiv" class="bg-[#228be6] cursor-grab" />
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
import { BLANK_FACE_32X16 } from "@/constants/blankFace32x16";
import {
  ContextMenuEvent,
  ContextMenuTarget,
} from "@/constants/enums/ContextMenuEvent";
import { DefaultLink } from "@/elements/DefaultLink";
import { RectangleImage } from "@/elements/RectangleImage";
import { useEditorStore } from "@/stores/editor";
import { useFacesStore } from "@/stores/faces";
import * as joint from "jointjs";
import { storeToRefs } from "pinia";
import { computed, onMounted } from "vue";
import ContextMenu from "./ContextMenu.vue";

const facesStore = useFacesStore();
const { isOpen, face } = storeToRefs(useEditorStore());

const {
  isContextMenuOpen,
  contextMenuPosition,
  contextMenuTargetId,
  contextMenuTargetType,
  openContextMenu,
  closeContextMenu,
} = useContextMenu();

const {
  elements,
  graph,
  paper,
  paperDiv,
  initializePaper,
  createElement,
  updateGraphConfig,
  updateDiagram,
} = useDiagram();

const contextMenuTarget = computed(() =>
  elements.value.find((element) => element.id === contextMenuTargetId.value)
);

const removeLink: joint.linkTools.Button.ActionCallback = (_, linkView) => {
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
});

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
