import JSZip from "jszip";
import { saveAs } from "file-saver";

interface FileData {
  name: string;
  contents: string | Blob;
}

const staticFiles = [
  {
    name: "moody/moody.ino",
    contents:
      "https://raw.githubusercontent.com/tsomic/moody-arduino/main/moody/moody.ino",
  },
];

export const useFile = () => {
  const generateAndDownloadZip = async (files: FileData[]) => {
    const allFiles = (await getStaticFiles()).concat(files);

    const zip = new JSZip();

    allFiles.forEach((file) => {
      zip.file(file.name, file.contents);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "moody.zip");
  };

  const getStaticFiles = async (): Promise<FileData[]> => {
    return Promise.all(
      staticFiles.map(async (file) => ({
        name: file.name,
        contents: await (await fetch(file.contents)).blob(),
      }))
    );
  };

  return { generateAndDownloadZip };
};
