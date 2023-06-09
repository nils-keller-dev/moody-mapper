import { DefaultLink } from "@/elements/DefaultLink";
import { useEditorStore } from "@/stores/editor";
import { useFacesStore } from "@/stores/faces";
import * as joint from "jointjs";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { RectangleImage } from "../elements/RectangleImage";

export const useDiagram = () => {
  const customNamespace = {
    custom: {
      RectangleImage,
    },
    standard: {
      Link: DefaultLink,
    },
  };

  const { faces } = storeToRefs(useFacesStore());
  const { face } = storeToRefs(useEditorStore());

  const graph = new joint.dia.Graph({}, { cellNamespace: customNamespace });
  const paper = ref();
  const paperDiv = ref<HTMLDivElement | null>(null);

  const initializePaper = (
    removeLink: joint.linkTools.Button.ActionCallback
  ) => {
    const removeButton = new joint.linkTools.Remove({
      distance: 8,
      action: removeLink,
    });

    const targetArrowheadTool = new joint.linkTools.TargetArrowhead();

    const toolsView = new joint.dia.ToolsView({
      tools: [targetArrowheadTool, removeButton],
    });

    paper.value = new joint.dia.Paper({
      cellViewNamespace: customNamespace,
      el: paperDiv.value,
      width: "100%",
      height: "100%",
      model: graph,
      gridSize: 30,
      linkPinning: false,
      defaultLink: () => new DefaultLink(),
      validateConnection: (cellViewS, magnetS, cellViewT, magnetT) => {
        if (magnetS === magnetT) return false;

        const links = graph.getLinks();
        // @ts-ignore
        const sourceId = cellViewS.model.id;
        // @ts-ignore
        const targetId = cellViewT.model.id;

        return links.every(
          (link) =>
            !(
              link.getSourceElement()?.id === sourceId &&
              link.getTargetElement()?.id === targetId
            )
        );
      },
    });

    paper.value.on("link:mouseenter", (linkView: joint.dia.LinkView) => {
      linkView.addTools(toolsView);
    });

    paper.value.on("blank:mouseover", paper.value.removeTools);
  };

  watch(
    faces,
    () => {
      if (!face.value) return;
      graph.getElements().forEach((cell) => {
        if (
          cell.prop("type") === "custom.RectangleImage" &&
          cell.prop("name") === face.value
        ) {
          cell.prop(
            "images",
            faces.value.find((f) => f.name === face.value)?.images
          );
        }
      });
    },
    { deep: true }
  );

  return {
    customNamespace,
    graph,
    paper,
    paperDiv,
    initializePaper,
  };
};
