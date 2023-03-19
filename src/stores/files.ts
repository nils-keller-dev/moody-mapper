import { defineStore } from "pinia";
import { useFile } from "@/composables/file";

const SUPPORTED_IMAGE_TYPES = ["jpg", "jpeg", "png", "bmp"];

export const useFilesStore = defineStore("files", {
  state: () => ({
    faces: [] as Array<FileSystemFileHandle>,
    configuration: null as null | FileSystemFileHandle,
    arduinoFile: null as null | FileSystemFileHandle,
  }),
  actions: {
    async fillStore(dirHandle: FileSystemDirectoryHandle) {
      const { getPathHandle } = useFile();
      const imagesHandle = await getPathHandle(
        dirHandle,
        "moody-images/images"
      );

      const getFilesFromDirectory = async (
        directory: FileSystemDirectoryHandle
      ): Promise<FileSystemFileHandle[]> => {
        const files: FileSystemFileHandle[] = [];

        //@ts-ignore
        for await (const entry of directory.values()) {
          if (entry.kind === "directory") {
            const subDirFiles = await getFilesFromDirectory(
              entry as FileSystemDirectoryHandle
            );
            files.push(...subDirFiles);
          } else if (
            SUPPORTED_IMAGE_TYPES.includes(
              entry.name.split(".")[1].toLowerCase()
            )
          ) {
            files.push(await entry);
          }
        }

        return files;
      };

      this.faces = await getFilesFromDirectory(
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
