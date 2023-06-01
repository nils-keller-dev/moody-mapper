import { defineStore } from "pinia";

export const useDiagramStore = defineStore("diagram", {
  state: () => ({
    graphConfig: "",
  }),
});
