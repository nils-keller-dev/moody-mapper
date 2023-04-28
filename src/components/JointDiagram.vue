<template>
  <div
    ref="paperDiv"
    class="w-full h-full m-auto border-2 border-black border-solid bg-black"
  />
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

const switchAllFaces = () => {
  elements.value.forEach(switchFace);
};

// TODO fix typing
const switchFace = (element: joint.shapes.basic.Image | any) => {
  const images = element.prop("images");
  const currentImage = element.attr("image/xlinkHref");

  element.attr("image/xlinkHref", images[currentImage === images[0] ? 1 : 0]);
};

watch(
  () => faces.value.length,
  () => {
    clearInterval(animationInterval.value);

    faces.value.forEach((face) => {
      elements.value.push(addElement(100, 100, face.name, face.images));
    });

    animationInterval.value = setInterval(switchAllFaces, 1e3);

    // var link = new joint.shapes.standard.Link({
    //   attrs: {
    //     line: {
    //       stroke: "white",
    //     },
    //   },
    // });
    // link.source(hello);
    // link.target(world);
    // link.addTo(graph);
  }
);

onMounted(() => {
  new joint.dia.Paper({
    el: paperDiv.value,
    width: "100%",
    height: "100%",
    model: graph,
    defaultConnectionPoint: { name: "boundary" },
    defaultConnector: { name: "smooth" },
    interactive: { linkMove: false },
  });
});

let namespace = joint.shapes;
let graph = new joint.dia.Graph({}, { cellNamespace: namespace });

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
      },
    },
  });

  return image.addTo(graph);
};
</script>
