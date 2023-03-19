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

  return { getPathHandle, getFile };
};
