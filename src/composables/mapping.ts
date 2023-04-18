import { useDiagramStore } from "@/stores/diagram";
import { useFacesStore } from "@/stores/faces";
import { useFilesStore } from "@/stores/files";
import { storeToRefs } from "pinia";

export const useMapping = () => {
  const { faces } = storeToRefs(useFacesStore());
  const { nodes } = storeToRefs(useDiagramStore());
  const { faces: faceFiles } = storeToRefs(useFilesStore());

  const generateArduinoFaces = async () => {
    const canvas = new OffscreenCanvas(32, 16);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error();

    const faceKeys = Object.keys(faceFiles.value).sort();

    const outputData = [];

    for (let i = 0; i < faceKeys.length; i++) {
      const face = faceKeys[i];

      const fileHandles = faceFiles.value[face].sort((a, b) =>
        b.name.localeCompare(a.name)
      );

      const faceData = [];
      for (let j = 0; j < fileHandles.length; j++) {
        const fileHandle = fileHandles[j];
        const file = await fileHandle.getFile();
        const img = await createImageBitmap(file);

        ctx.drawImage(img, 0, 0);
        const pixelData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        const binaryStrings = generateBinaryStrings(pixelData);

        faceData.push(`{${binaryStrings.join(", ")}}`);
      }

      let facesString = faceData.map((item) => `    ${item}`).join(",\n");
      facesString = ["  {", facesString, "  }"].join("\n");

      outputData.push(facesString);
    }

    const outputString = [
      "static const byte allFaces[][2][64] PROGMEM = {",
      outputData.join(",\n"),
      "};\n",
    ].join("\n");

    return outputString;
  };

  const generateBinaryStrings = (pixelData: Uint8ClampedArray) => {
    const redChannelData = Array.from(pixelData, (_, i) => pixelData[i * 4])
      .filter((val) => val !== undefined)
      .map((val) => (val ? 0 : 1));

    const binaryStrings = [];

    for (let i = 0; i < redChannelData.length; i += 8) {
      const slice = redChannelData.slice(i, i + 8);
      const binaryString = `0b${slice.join("")}`;
      binaryStrings.push(binaryString);
    }

    return binaryStrings;
  };

  const generateConfigFile = () => {
    const mappings = generateMappings();
    const maxLinks = getMaxLinks(mappings);
    const fileMappings = generateFileMappings(mappings, maxLinks);

    return `#define NUMBER_FACES ${faces.value.length}
#define INVALID_FACE -1
${generateDefines()}\n
const int8_t nextFaces[][${maxLinks}] = {
${fileMappings}};\n`;
  };

  const generateDefines = () => {
    return faces.value
      .map((face, index) => `#define ${face.name.toUpperCase()} ${index}`)
      .join("\n");
  };

  const getMaxLinks = (mappings: Record<string, string[]>) => {
    return Object.values(mappings).reduce(
      (acc, cur) => Math.max(acc, cur.length),
      0
    );
  };

  const generateMappings = () => {
    const mappings = {};

    nodes.value?.each((node) => {
      const iterator = node.findLinksOutOf();
      while (iterator.next()) {
        const item = iterator.value;
        addMapping(mappings, item.data.from, faces.value[item.data.to]);

        if (item.data.isBiDirectional) {
          addMapping(mappings, item.data.to, faces.value[item.data.from]);
        }
      }
    });

    return mappings;
  };

  const addMapping = (
    map: Record<string, string[]>,
    key: number,
    mapping: {
      name: string;
      images: string[];
    }
  ) => {
    if (!map[key]) map[key] = [];
    map[key].push(mapping.name.toUpperCase());
  };

  const generateFileMappings = (
    mappings: Record<string, string[]>,
    max: number
  ) => {
    const fullMappings: Record<string, string[]> = {};

    Object.keys(mappings).forEach((key) => {
      fullMappings[key] = mappings[key].concat(
        Array(max - mappings[key].length).fill("INVALID_FACE")
      );
    });

    let fileMappings = "";

    faces.value.forEach((face, index) => {
      if (!fullMappings[index]) {
        fullMappings[index] = Array(max).fill("INVALID_FACE");
      }
      fileMappings += `  {${fullMappings[index].join(", ")}}`;
      if (index !== faces.value.length - 1) fileMappings += ",";
      fileMappings += ` //${face.name.toUpperCase()}\n`;
    });

    return fileMappings;
  };

  return {
    generateConfigFile,
    generateArduinoFaces,
  };
};
