import type { RectangleImage } from "@/elements/RectangleImage";
import { defineStore } from "pinia";

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    elements: [] as Array<RectangleImage>,
    graphConfig: "",
  }),
});
