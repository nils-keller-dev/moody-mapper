import { defineStore } from "pinia";

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/bmp"];

export const useFacesStore = defineStore("faces", {
  state: () => ({
    faces: [] as Array<{ name: string; images: string[] }>,
  }),
  actions: {
    fillFaces(files: FileList) {
      const faceGroups: Record<string, string[]> = {};

      Array.from(files)
        .filter((file) => SUPPORTED_IMAGE_TYPES.includes(file.type))
        .forEach((file) => {
          const faceName = file.webkitRelativePath.split("/")[1];
          if (!faceGroups[faceName]) faceGroups[faceName] = [];
          faceGroups[faceName].push(URL.createObjectURL(file));
        });

      const facesArray: Array<{ name: string; images: string[] }> = [];
      Object.keys(faceGroups).forEach((name) => {
        facesArray.push({ name, images: faceGroups[name] });
      });

      facesArray.sort((a, b) => a.name.localeCompare(b.name));

      this.faces = facesArray;
    },
  },
});
