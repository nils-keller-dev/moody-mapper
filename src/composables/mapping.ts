import { useDiagramStore } from "@/stores/diagram";
import { useFacesStore } from "@/stores/faces";
import { storeToRefs } from "pinia";

export const useMapping = () => {
  const { faces } = storeToRefs(useFacesStore());
  const { nodes } = storeToRefs(useDiagramStore());

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

  const getMaxLinks = (mappings) => {
    return Object.values(mappings).reduce(
      (acc: any, cur: any) => Math.max(acc, cur.length),
      0
    );
  };

  const generateMappings = () => {
    const mappings = {};

    nodes.value.each((node) => {
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

  const addMapping = (map, key, mapping) => {
    if (!map[key]) map[key] = [];
    map[key].push(mapping.name.toUpperCase());
  };

  const generateFileMappings = (mappings, max) => {
    const fullMappings = {};

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

  return { generateConfigFile };
};
