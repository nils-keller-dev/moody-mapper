<template>
  <div ref="paperDiv" class="border-2 border-black border-solid" />
</template>

<script lang="ts" setup>
import { useDiagramStore } from "@/stores/diagram";
import { useFacesStore } from "@/stores/faces";
import * as joint from "jointjs";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";

const paperDiv = ref<HTMLDivElement | null>(null);
const { faces } = storeToRefs(useFacesStore());
const { elements } = storeToRefs(useDiagramStore());
const animationInterval = ref<number>();
const graph = new joint.dia.Graph();
const paper = ref();

const switchAllFaces = () => {
  elements.value.forEach(switchFace);
};

const toolsView = new joint.dia.ToolsView({
  tools: [new joint.linkTools.Remove(), new joint.linkTools.TargetArrowhead()],
});

// TODO fix typing
// also: https://resources.jointjs.com/tutorials/joint/tutorials/Tsshape.html
const switchFace = (element: joint.shapes.basic.Image | any) => {
  const images = element.prop("images");
  const currentImage = element.attr("image/xlinkHref");

  element.attr("image/xlinkHref", images[currentImage === images[0] ? 1 : 0]);
};

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

watch(
  () => faces.value.length,
  () => {
    fillFromStore();
  }
);

onMounted(() => {
  paper.value = new joint.dia.Paper({
    el: paperDiv.value,
    width: "100%",
    height: "100%",
    model: graph,
    gridSize: 100,
    linkPinning: false,
    defaultLink: () => new joint.shapes.standard.Link(),
    validateConnection: (cellViewS, magnetS, cellViewT, magnetT) => {
      const links = graph.getLinks();

      const isUniqueConnection = links.every(
        (existingLink) =>
          !(
            existingLink.getSourceElement()?.id === cellViewS.model.id &&
            existingLink.getTargetElement()?.id === cellViewT.model.id
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
): joint.shapes.basic.Image => {
  const image = new joint.shapes.basic.Image({
    name,
    images,
    position: { x, y },
    size: {
      width: 200,
      height: 100,
    },
    attrs: {
      image: {
        xlinkHref: images[0],
        width: 32,
        height: 16,
        imageRendering: "pixelated",
        magnet: true,
      },
    },
  });

  return image.addTo(graph);
};
</script>
