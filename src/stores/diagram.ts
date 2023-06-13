import type { GraphConfig } from "@/constants/interfaces/GraphConfig";
import { defineStore } from "pinia";

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    graphConfig: {} as GraphConfig,
    isConfigUploaded: false,
  }),
});
