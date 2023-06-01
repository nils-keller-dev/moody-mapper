import { defineStore } from "pinia";

export const useFacesStore = defineStore("faces", {
  state: () => ({
    faces: [] as Array<{ name: string; images: string[] }>,
  }),
  actions: {
    // currently unused
    deleteFace(faceName: string) {
      this.faces = this.faces.filter((face) => face.name !== faceName);
    },
  },
});
