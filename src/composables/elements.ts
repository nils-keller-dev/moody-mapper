import { RectangleImage } from "@/elements/RectangleImage";
import { useFacesStore } from "@/stores/faces";
import type { dia } from "jointjs";
import { storeToRefs } from "pinia";
import { ref } from "vue";

export const useElements = () => {
  const { faces } = storeToRefs(useFacesStore());
  const elements = ref<RectangleImage[]>([]);

  const updateElements = (graph: dia.Graph) => {
    elements.value = graph
      .getElements()
      .filter(
        (element) => element.attr("type") !== "custom.RectangleImage"
      ) as RectangleImage[];
  };

  const switchAllFaces = () => {
    elements.value.forEach((element) => element.nextAnimationFrame());
  };

  const createElement = (
    x: number,
    y: number,
    name: string,
    images: Array<string>
  ): RectangleImage => {
    faces.value.push({ name, images });

    return new RectangleImage({
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

  return {
    elements,
    updateElements,
    switchAllFaces,
    createElement,
  };
};
