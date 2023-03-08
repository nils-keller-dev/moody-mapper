import { defineStore } from "pinia";

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/bmp"];

export const useFacesStore = defineStore("faces", {
  state: () => ({
    faces: [],
  }),
  actions: {
    fillFaces(files) {
      const faceGroups = {};

      Array.from(files)
        .filter((file) => SUPPORTED_IMAGE_TYPES.includes(file.type))
        .forEach((file: any) => {
          const faceName = file.webkitRelativePath.split("/")[1];
          if (!faceGroups[faceName]) faceGroups[faceName] = [];
          faceGroups[faceName].push(URL.createObjectURL(file));
        });

      const facesArray = [];
      Object.keys(faceGroups).forEach((name) => {
        facesArray.push({ name, images: faceGroups[name] });
      });

      facesArray.sort((a, b) => a.name.localeCompare(b.name));

      this.faces = facesArray;
    },
  },
});
