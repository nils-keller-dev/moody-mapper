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
    />
  </div>
</template>

<script lang="ts" setup>
import { BLANK_FACE_32X16 } from "@/constants/blankFace32x16";
import { ContextMenuEvent } from "@/constants/enums/ContextMenuEvent";
import { DefaultLink } from "@/elements/DefaultLink";
import { RectangleImage } from "@/elements/RectangleImage";
import { useDiagramStore } from "@/stores/diagram";
import { useEditorStore } from "@/stores/editor";
import { useFacesStore } from "@/stores/faces";
import * as joint from "jointjs";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import ContextMenu from "./ContextMenu.vue";

const paperDiv = ref<HTMLDivElement | null>(null);
const { faces } = storeToRefs(useFacesStore());
const { isOpen, element } = storeToRefs(useEditorStore());
const { graphConfig } = storeToRefs(useDiagramStore());

const animationInterval = ref<number>();
const namespace = joint.shapes;
const graph = new joint.dia.Graph({}, { cellNamespace: namespace });
const paper = ref();

const isContextMenuOpen = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

const elements = ref<RectangleImage[]>([]);

const updateElements = () => {
  elements.value = graph
    .getElements()
    .filter(
      (element) => element.attr("type") !== "custom.RectangleImage"
    ) as RectangleImage[];
};

const switchAllFaces = () => {
  elements.value.forEach((element) => element.nextAnimationFrame());
};

const targetArrowheadTool = new joint.linkTools.TargetArrowhead();
const removeButton = new joint.linkTools.Remove({
  distance: 8,
});

const toolsView = new joint.dia.ToolsView({
  tools: [targetArrowheadTool, removeButton],
});

onMounted(() => {
  paper.value = new joint.dia.Paper({
    cellViewNamespace: namespace,
    el: paperDiv.value,
    width: "100%",
    height: "100%",
    model: graph,
    gridSize: 30,
    linkPinning: false,
    defaultLink: () => new DefaultLink(),
    validateConnection: (cellViewS, magnetS, cellViewT, magnetT) => {
      if (magnetS === magnetT) return false;

      const links = graph.getLinks();
      // @ts-ignore
      const sourceId = cellViewS.model.id;
      // @ts-ignore
      const targetId = cellViewT.model.id;

      return links.every(
        (link) =>
          !(
            link.getSourceElement()?.id === sourceId &&
            link.getTargetElement()?.id === targetId
          )
      );
    },
  });

  paper.value.on("link:mouseenter", (linkView: joint.dia.LinkView) => {
    linkView.addTools(toolsView);
  });

  paper.value.on("blank:mouseover", paper.value.removeTools);

  paper.value.on("element:pointerdblclick", editFace);

  paper.value.on("blank:contextmenu blank:pointerdown", (e: MouseEvent) => {
    isContextMenuOpen.value = true;
    contextMenuPosition.value = { x: e.clientX, y: e.clientY };
  });

  paper.value.on("blank:pointerdown", () => {
    isContextMenuOpen.value = false;
  });
});

const fillFromStore = () => {
  if (!graphConfig.value) return;
  clearInterval(animationInterval.value);
  graph.clear();
  faces.value = [];

  const cells: Array<joint.dia.Cell> = [];
  JSON.parse(graphConfig.value).cells.forEach((cell: any) => {
    const createdCell = (() => {
      switch (cell.type) {
        case "custom.RectangleImage":
          return createElement(
            cell.position.x,
            cell.position.y,
            cell.name,
            cell.images,
            cell.id
          );
        case "standard.Link":
          return new DefaultLink({
            source: { id: cell.source.id },
            target: { id: cell.target.id },
          });
        default:
          return;
      }
    })() as joint.dia.Cell;

    if (createdCell) cells.push(createdCell);
  });

  graph.addCells(cells);
  updateElements();

  animationInterval.value = setInterval(switchAllFaces, 1e3);
};

const createElement = (
  x: number,
  y: number,
  name: string,
  images: Array<string>,
  id?: string
): RectangleImage => {
  faces.value.push({ name, images });

  return new RectangleImage({
    id,
    name,
    images,
    position: { x, y },
    attrs: {
      label: {
        text: name,
      },
      image: {
        xlinkHref: images[0],
      },
    },
  });
};

const editFace = (el: joint.dia.ElementView) => {
  console.log(JSON.stringify(graph.toJSON()));

  isOpen.value = true;
  // @ts-ignore
  element.value = el.model as RectangleImage;
};

const onContextMenuClick = (e: ContextMenuEvent) => {
  isContextMenuOpen.value = false;
  switch (e) {
    case ContextMenuEvent.ADD:
      addNewFace();
      break;
    default:
      break;
  }
};

const addNewFace = () => {
  const faceName = window.prompt("Enter face name");
  if (!faceName) return;
  const { x, y } = contextMenuPosition.value;
  createElement(x, y, faceName, Array(2).fill(BLANK_FACE_32X16)).addTo(graph);
  updateElements();
};

watch(() => graphConfig.value, fillFromStore);
</script>
