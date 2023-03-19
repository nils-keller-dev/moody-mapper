import { defineStore } from "pinia";

export const useFacesStore = defineStore("faces", {
  state: () => ({
    faces: [] as Array<{ name: string; images: string[] }>,
  }),
  actions: {
    async fillFaces(fileHandles: Array<FileSystemFileHandle>) {
      const faceGroups: Record<string, string[]> = {};

      const files = await Promise.all(
        fileHandles.map(
          async (handle) => new File([await handle.getFile()], handle.name)
        )
      );

      files.forEach((file) => {
        // extract face name from file name
        const faceName = file.name.split(".")[0].split("_")[0];

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
