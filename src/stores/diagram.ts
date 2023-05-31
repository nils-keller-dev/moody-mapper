import type { RectangleImage } from "@/elements/RectangleImage";
import { defineStore } from "pinia";

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    model: undefined as go.Model | undefined, // deprecated
    nodes: undefined as go.Iterator<go.Node> | undefined, // deprecated
    elements: [] as Array<RectangleImage>,
    graphConfig: "",
  }),
});
