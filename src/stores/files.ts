import { useFile } from "@/composables/file";
import { defineStore } from "pinia";

const SUPPORTED_IMAGE_TYPES = ["jpg", "jpeg", "png", "bmp"];

export const useFilesStore = defineStore("files", {
  state: () => ({
    faces: {} as Record<string, Array<FileSystemFileHandle>>,
    configuration: null as null | FileSystemFileHandle,
    arduinoFaces: null as null | FileSystemFileHandle,
    arduinoConfig: null as null | FileSystemFileHandle,
    imagesHandle: null as null | FileSystemDirectoryHandle,
  }),
  actions: {
    async fillStore(dirHandle: FileSystemDirectoryHandle) {
      const { getPathHandle } = useFile();
      this.imagesHandle = (await getPathHandle(
        dirHandle,
        "moody-images/images"
      )) as FileSystemDirectoryHandle;

      await this.loadFaces();

      this.configuration = (await getPathHandle(
        dirHandle,
        "moody-mapper/facesConfig.json"
      )) as FileSystemFileHandle;

      this.arduinoConfig = (await getPathHandle(
        dirHandle,
        "moody-arduino/moody/facesConfig.h"
      )) as FileSystemFileHandle;

      this.arduinoFaces = (await getPathHandle(
        dirHandle,
        "moody-arduino/moody/faces.h"
      )) as FileSystemFileHandle;
    },
    async loadFaces() {
      this.faces = await this.getFacesFromDirectory(
        this.imagesHandle as FileSystemDirectoryHandle
      );
    },
  },
  getters: {
    getFacesFromDirectory() {
      return async (directory: FileSystemDirectoryHandle) => {
        const { extractFaceName } = useFile();

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
    },
  },
});
