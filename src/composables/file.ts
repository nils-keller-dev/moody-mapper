import JSZip from "jszip";
import { saveAs } from "file-saver";

interface FileData {
  name: string;
  contents: string;
}

export const useFile = () => {
  const generateAndDownloadZip = async (files: FileData[]) => {
    const zip = new JSZip();

    files.forEach((file) => {
      zip.file(file.name, file.contents);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "files.zip");
  };

  return { generateAndDownloadZip };
};
