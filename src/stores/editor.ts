import type { RectangleImage } from "@/elements/RectangleImage";
import { defineStore } from "pinia";

export const useEditorStore = defineStore("editor", {
  state: () => ({
    isOpen: false,
    element: null as RectangleImage | null,
  }),
});
