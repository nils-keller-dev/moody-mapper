import { useFile } from "@/composables/file";
import { defineStore } from "pinia";

export const useFacesStore = defineStore("faces", {
  state: () => ({
    faces: [] as Array<{ name: string; images: string[] }>,
  }),
  actions: {
    async fillFaces(fileHandles: Record<string, Array<FileSystemFileHandle>>) {
      const faceGroups: Record<string, string[]> = {};

      for (const [faceName, fileArray] of Object.entries(fileHandles)) {
        const faces = await Promise.all(
          fileArray.map(async (handle) =>
            URL.createObjectURL(new File([await handle.getFile()], handle.name))
          )
        );

        faceGroups[faceName] = faces;
      }

      const facesArray: Array<{ name: string; images: string[] }> = [];
      Object.keys(faceGroups).forEach((name) => {
        facesArray.push({ name, images: faceGroups[name] });
      });

      facesArray.sort((a, b) => a.name.localeCompare(b.name));

      this.faces = facesArray;
    },
  },
});
