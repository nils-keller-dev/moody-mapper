<template>
  <div ref="paperDiv" class="border-2 border-black border-solid bg-black" />
</template>

<script lang="ts" setup>
import { RectangleImage } from "@/elements/RectangleImage";
import { useDiagramStore } from "@/stores/diagram";
import { useFacesStore } from "@/stores/faces";
import * as joint from "jointjs";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";

const paperDiv = ref<HTMLDivElement | null>(null);
const { faces } = storeToRefs(useFacesStore());
const { elements } = storeToRefs(useDiagramStore());
const animationInterval = ref<number>();
const namespace = joint.shapes;
const graph = new joint.dia.Graph({}, { cellNamespace: namespace });
const paper = ref();

const switchAllFaces = () => {
  elements.value.forEach((element) => element.nextAnimationFrame());
};

var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
var removeButton = new joint.linkTools.Remove();

var toolsView = new joint.dia.ToolsView({
  tools: [targetArrowheadTool, removeButton],
});

const fillFromStore = () => {
  clearInterval(animationInterval.value);

  graph.clear();

  elements.value = [];

  faces.value.forEach((face, index) => {
    elements.value.push(
      addElement(index * 40, Math.random() * 400, face.name, face.images)
    );
  });

  animationInterval.value = setInterval(switchAllFaces, 1e3);

  const link = new joint.shapes.standard.Link();

  link.source(elements.value[0]);
  link.target(elements.value[1]);
  link.addTo(graph);
};

watch(() => faces.value.length, fillFromStore);

onMounted(() => {
  paper.value = new joint.dia.Paper({
    cellViewNamespace: namespace,
    el: paperDiv.value,
    width: "100%",
    height: "100%",
    model: graph,
    gridSize: 30,
    linkPinning: false,
    defaultLink: () =>
      new joint.shapes.standard.Link({
        attrs: {
          line: {
            stroke: "white",
          },
        },
      }),
    validateConnection: (cellViewS, magnetS, cellViewT, magnetT) => {
      const links = graph.getLinks();

      const sourceId = cellViewS.model.id;
      const targetId = cellViewT.model.id;

      const isUniqueConnection = links.every(
        (link) =>
          !(
            link.getSourceElement()?.id === sourceId &&
            link.getTargetElement()?.id === targetId
          )
      );

      return isUniqueConnection && magnetS !== magnetT;
    },
  });

  paper.value.on("link:mouseenter", (linkView: joint.dia.LinkView) => {
    linkView.addTools(toolsView);
  });

  paper.value.on("blank:mouseover", () => {
    paper.value.removeTools();
  });

  fillFromStore();
});

const addElement = (
  x: number,
  y: number,
  name: string,
  images: Array<string>
): RectangleImage => {
  const image = new RectangleImage({
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

  return image.addTo(graph);
};
</script>

<style>
image {
  filter: invert(1);
}
</style>
