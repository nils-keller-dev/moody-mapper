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
import { DefaultLink } from "../elements/DefaultLink";

const paperDiv = ref<HTMLDivElement | null>(null);
const { faces } = storeToRefs(useFacesStore());
const diagramStore = useDiagramStore();
const animationInterval = ref<number>();
const graph = new joint.dia.Graph();
const paper = ref();

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

  paper.value.on("blank:mouseover", () => {
    paper.value.removeTools();
  });

  fillFromStore();
});

const fillFromStore = () => {
  clearInterval(animationInterval.value);
  graph.clear();
  diagramStore.$reset();

  const random = (max: number = 900, step: number = 30) => {
    const r = Math.random() * max;
    return r - (r % step);
  };

  faces.value.forEach((face) => {
    diagramStore.elements.push(
      addElement(random(), random(), face.name, face.images)
    );
  });

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

watch(() => faces.value.length, fillFromStore);
</script>
