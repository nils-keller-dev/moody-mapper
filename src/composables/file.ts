export const useFile = () => {
  const getSubDirectory = async (
    dirHandle: FileSystemDirectoryHandle,
    dirName: string
  ) => {
    //@ts-ignore
    for await (const entry of dirHandle.values()) {
      if (entry.kind === "directory" && entry.name === dirName) {
        return await dirHandle.getDirectoryHandle(entry.name, {
          create: false,
        });
      }
    }
  };

  const getFile = async (
    dirHandle: FileSystemDirectoryHandle,
    fileName: string
  ) => {
    //@ts-ignore
    for await (const entry of dirHandle.values()) {
      if (entry.kind === "file" && entry.name === fileName) {
        return await dirHandle.getFileHandle(entry.name);
      }
    }
  };

  const getPathHandle = async (
    dirHandle: FileSystemDirectoryHandle,
    path: string
  ) => {
    const pathArray = path.split("/");
    let currentHandle: FileSystemHandle | undefined = dirHandle;
    for (const [index, dirName] of pathArray.entries()) {
      if (index === pathArray.length - 1 && dirName.includes(".")) {
        currentHandle = await getFile(
          currentHandle as FileSystemDirectoryHandle,
          dirName
        );
      } else {
        currentHandle = await getSubDirectory(
          currentHandle as FileSystemDirectoryHandle,
          dirName
        );
      }
    }
    return currentHandle;
  };

  const extractFaceName = (fileName: string) => {
    return fileName.split(".")[0].split("_")[0];
  };

  const createNewFile = async (
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
    content: Blob
  ) => {
    const fileHandle = await dirHandle.getFileHandle(fileName, {
      create: true,
    });
    // @ts-ignore
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  };

  const deleteDirectory = async (
    dirHandle: FileSystemDirectoryHandle,
    name: string
  ) => {
    await dirHandle.removeEntry(name, { recursive: true });
  };

  return {
    getPathHandle,
    getFile,
    extractFaceName,
    createNewFile,
    deleteDirectory,
  };
};
