import { DefaultLink } from "@/elements/DefaultLink";
import { useDiagramStore } from "@/stores/diagram";
import { useEditorStore } from "@/stores/editor";
import { useFacesStore } from "@/stores/faces";
import * as joint from "jointjs";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { RectangleImage } from "../elements/RectangleImage";

const customNamespace = {
  custom: {
    RectangleImage,
  },
  standard: {
    Link: DefaultLink,
  },
};

const MIN_SCALE = 0.4;
const MAX_SCALE = 2;

export const useDiagram = () => {
  const { faces } = storeToRefs(useFacesStore());
  const { face } = storeToRefs(useEditorStore());
  const { graphConfig, isConfigUploaded } = storeToRefs(useDiagramStore());

  const graph = new joint.dia.Graph({}, { cellNamespace: customNamespace });
  const paper = ref();
  const paperDiv = ref<HTMLDivElement | null>(null);
  const elements = ref<RectangleImage[]>([]);

  const origin = ref({ x: 0, y: 0 });
  const isPanning = ref(false);

  const handleBlankPointerDown = (e: MouseEvent) => {
    if (e.button === 0) {
      isPanning.value = true;
      origin.value = { x: e.clientX, y: e.clientY };
    }
  };

  const handleBlankPointerUp = () => {
    if (paperDiv.value) {
      isPanning.value = false;
      paperDiv.value.style.cursor = "grab";
    }
  };

  const handleBlankPointerMove = (e: MouseEvent) => {
    if (paperDiv.value && isPanning.value) {
      paperDiv.value.style.cursor = "grabbing";

      const { tx, ty } = paper.value.translate();
      const dx = origin.value.x - e.clientX;
      const dy = origin.value.y - e.clientY;

      paper.value.translate(tx - dx, ty - dy);

      origin.value = { x: e.clientX, y: e.clientY };
    }
  };

  // magic
  // https://github.com/clientIO/joint/issues/1027#issuecomment-454683309
  const scaleToPoint = (nextScale: number, x: number, y: number) => {
    if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
      const currentScale = paper.value.scale().sx;

      const beta = currentScale / nextScale;

      const ax = x - x * beta;
      const ay = y - y * beta;

      const translate = paper.value.translate();

      const nextTx = translate.tx - ax * nextScale;
      const nextTy = translate.ty - ay * nextScale;

      paper.value.translate(nextTx, nextTy);

      const ctm = paper.value.matrix();

      ctm.a = nextScale;
      ctm.d = nextScale;

      paper.value.matrix(ctm);
    }
  };

  const handleCanvasMouseWheel = (
    e: any,
    x: number,
    y: number,
    delta: number
  ) => {
    const evt = e.originalEvent as WheelEvent;

    if (e.ctrlKey || e.metaKey) {
      scaleToPoint(paper.value.scale().sx + delta * 0.1, x, y);
    } else {
      const { tx, ty } = paper.value.translate();
      const dx = evt.deltaX;
      const dy = evt.deltaY;

      paper.value.translate(tx - dx, ty - dy);
    }
  };

  const updateElements = (graph: joint.dia.Graph) => {
    elements.value = graph
      .getElements()
      .filter(
        (element) => element.attr("type") !== "custom.RectangleImage"
      ) as RectangleImage[];
  };

  const switchAllFaces = () => {
    elements.value.forEach((element) => element.nextAnimationFrame());
  };

  const createElement = (
    x: number,
    y: number,
    name: string,
    images: Array<string>
  ): RectangleImage => {
    faces.value.push({ name, images });

    return new RectangleImage({
      name,
      images,
      position: { x, y },
      attrs: {
        label: {
          text: name,
        },
        image: {
          xlinkHref: images[0],
        },
      },
    });
  };

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

    paper.value.on("blank:pointerdown", handleBlankPointerDown);
    paper.value.on("blank:pointerup", handleBlankPointerUp);
    paper.value.on("blank:pointermove", handleBlankPointerMove);

    paper.value.on("blank:mousewheel ", handleCanvasMouseWheel);
    paper.value.on(
      "cell:mousewheel ",
      (_: any, e: any, x: number, y: number, d: number) => {
        handleCanvasMouseWheel(e, x, y, d);
      }
    );
  };

  const updateGraphConfig = () => {
    graphConfig.value = graph.toJSON();
  };

  const updateDiagram = () => {
    updateElements(graph);
    updateGraphConfig();
  };

  watch(graphConfig, () => {
    if (!graphConfig.value || !isConfigUploaded.value) return;

    isConfigUploaded.value = false;
    graph.clear();
    faces.value = [];

    graph.fromJSON(graphConfig.value);

    graphConfig.value.cells.forEach((cell) => {
      if (cell.type === "custom.RectangleImage") {
        faces.value.push({
          name: cell.name,
          images: cell.images,
        });
      }
    });

    updateDiagram();
  });

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

  setInterval(switchAllFaces, 1e3);

  return {
    elements,
    graph,
    paper,
    paperDiv,
    initializePaper,
    createElement,
    updateGraphConfig,
    updateDiagram,
  };
};
