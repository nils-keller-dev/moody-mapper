import { defineStore } from "pinia";
import { useFile } from "@/composables/file";

const SUPPORTED_IMAGE_TYPES = ["jpg", "jpeg", "png", "bmp"];

export const useFilesStore = defineStore("files", {
  state: () => ({
    faces: {} as Record<string, Array<FileSystemFileHandle>>,
    configuration: null as null | FileSystemFileHandle,
    arduinoFile: null as null | FileSystemFileHandle,
  }),
  actions: {
    async fillStore(dirHandle: FileSystemDirectoryHandle) {
      const { getPathHandle, extractFaceName } = useFile();
      const imagesHandle = await getPathHandle(
        dirHandle,
        "moody-images/images"
      );

      const getFacesFromDirectory = async (
        directory: FileSystemDirectoryHandle
      ) => {
        const faces: Record<string, Array<FileSystemFileHandle>> = {};

        //@ts-ignore
        for await (const entry of directory.values()) {
          if (entry.kind === "directory") {
            for await (const file of entry.values()) {
              if (
                SUPPORTED_IMAGE_TYPES.includes(
                  file.name.split(".")[1].toLowerCase()
                )
              ) {
                const faceName = extractFaceName(file.name);

                if (!faces[faceName]) faces[faceName] = [];
                faces[faceName].push(file);
              }
            }
          }
        }

        return faces;
      };

      this.faces = await getFacesFromDirectory(
        imagesHandle as FileSystemDirectoryHandle
      );

      this.configuration = (await getPathHandle(
        dirHandle,
        "moody-mapper/facesConfig.json"
      )) as FileSystemFileHandle;

      this.arduinoFile = (await getPathHandle(
        dirHandle,
        "moody-arduino/moody/facesConfig.h"
      )) as FileSystemFileHandle;
    },
  },
});
