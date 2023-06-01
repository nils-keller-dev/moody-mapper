import type {
  AbstractedLink,
  AbstractedRectangleImage,
} from "@/constants/interfaces/AbstractedElements";
import { defineStore } from "pinia";

interface GraphConfig {
  cells: AbstractedRectangleImage[] | AbstractedLink[];
}

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    graphConfig: {} as GraphConfig,
    isConfigUploaded: false,
  }),
});
