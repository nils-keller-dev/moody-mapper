import type { dia } from "jointjs";
import { defineStore } from "pinia";

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    graphConfig: {} as dia.Graph,
    isConfigUploaded: false,
  }),
});
