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
const { isOpen, face } = storeToRefs(useEditorStore());
const diagramStore = useDiagramStore();

const animationInterval = ref<number>();
const namespace = joint.shapes;
const graph = new joint.dia.Graph({}, { cellNamespace: namespace });
const paper = ref();

const isContextMenuOpen = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

const switchAllFaces = () => {
  diagramStore.elements.forEach((element) => element.nextAnimationFrame());
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

  fillFromStore();
});

const fillFromStore = () => {
  if (!diagramStore.graphConfig) return;
  clearInterval(animationInterval.value);
  graph.clear();
  // diagramStore.$reset();

  // const random = (max: number = 900, step: number = 30) => {
  //   const r = Math.random() * max;
  //   return r - (r % step);
  // };

  // faces.value.forEach((face) => {
  //   diagramStore.elements.push(
  //     addElement(random(), random(), face.name, face.images)
  //   );
  // });
  console.log(diagramStore.graphConfig);
  graph.fromJSON(JSON.parse(diagramStore.graphConfig));

  animationInterval.value = setInterval(switchAllFaces, 1e3);

  const link = new DefaultLink();

  link.source(diagramStore.elements[0]);
  link.target(diagramStore.elements[1]);
  link.addTo(graph);
};

const addElement = (
  x: number,
  y: number,
  name: string,
  images: Array<string>
): RectangleImage => {
  const image = new RectangleImage({
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

  diagramStore.elements.push(image);
  faces.value.push({ name, images });

  return image.addTo(graph);
};

const editFace = (element: joint.dia.ElementView) => {
  console.log(JSON.stringify(graph.toJSON()));

  // @ts-ignore
  const faceName = element.model.prop("name");
  isOpen.value = true;
  face.value = faceName;
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
  addElement(x, y, faceName, [BLANK_FACE_32X16, BLANK_FACE_32X16]);
};

watch(() => diagramStore.graphConfig, fillFromStore);
</script>
