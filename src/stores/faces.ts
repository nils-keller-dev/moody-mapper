import { defineStore } from "pinia";

export const useFacesStore = defineStore("faces", {
  state: () => ({
    faces: [] as Array<{ name: string; images: string[] }>,
  }),
  actions: {
    deleteFace(faceName: string) {
      this.faces = this.faces.filter((face) => face.name !== faceName);
    },
    renameFace(oldName: string, newName: string) {
      const face = this.faces.find((face) => face.name === oldName);
      if (face) {
        face.name = newName;
      }
    },
  },
});
