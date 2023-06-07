<template>
  <div class="w-full h-full">
    <div
      ref="paperDiv"
      class="border-2 border-black border-solid bg-[#228be6]"
    />
    <ContextMenu
      :isOpen="isContextMenuOpen"
      :x="contextMenuPosition.x"
      :y="contextMenuPosition.y"
      @click="onContextMenuClick"
      :targetType="contextMenuTargetType"
    />
  </div>
</template>

<script lang="ts" setup>
import { BLANK_FACE_32X16 } from "@/constants/blankFace32x16";
import {
  ContextMenuEvent,
  ContextMenuTarget,
} from "@/constants/enums/ContextMenuEvent";
import { DefaultLink } from "@/elements/DefaultLink";
import { RectangleImage } from "@/elements/RectangleImage";
import { useDiagramStore } from "@/stores/diagram";
import { useEditorStore } from "@/stores/editor";
import { useFacesStore } from "@/stores/faces";
import * as joint from "jointjs";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch, computed } from "vue";
import ContextMenu from "./ContextMenu.vue";

const paperDiv = ref<HTMLDivElement | null>(null);
const facesStore = useFacesStore();
const { isOpen, face } = storeToRefs(useEditorStore());
const { graphConfig, isConfigUploaded } = storeToRefs(useDiagramStore());

const customNamespace = {};

Object.assign(customNamespace, {
  custom: {
    RectangleImage,
  },
  standard: {
    Link: DefaultLink,
  },
});

const graph = new joint.dia.Graph({}, { cellNamespace: customNamespace });
const paper = ref();

const contextMenuTargetId = ref<string>("");
const contextMenuTarget = computed(() =>
  elements.value.find((element) => element.id === contextMenuTargetId.value)
);
const contextMenuTargetType = ref<ContextMenuTarget>(ContextMenuTarget.Canvas);

const isContextMenuOpen = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });

const elements = ref<RectangleImage[]>([]);

const switchAllFaces = () => {
  elements.value.forEach((element) => element.nextAnimationFrame());
};

const targetArrowheadTool = new joint.linkTools.TargetArrowhead();
const removeButton = new joint.linkTools.Remove({
  distance: 8,
  action: (_, linkView: joint.dia.LinkView) => {
    // @ts-ignore
    linkView.model.remove();
    updateGraphConfig();
  },
});

const toolsView = new joint.dia.ToolsView({
  tools: [targetArrowheadTool, removeButton],
});

const openContextMenu = (
  e: MouseEvent,
  targetType: ContextMenuTarget,
  id = ""
) => {
  contextMenuTargetId.value = id;
  contextMenuTargetType.value = targetType;
  contextMenuPosition.value = { x: e.clientX, y: e.clientY };
  isContextMenuOpen.value = true;
};

onMounted(() => {
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

  paper.value.on("element:pointerdblclick", (el: joint.dia.ElementView) => {
    // @ts-ignore
    editFace(el.model.prop("name"));
  });

  paper.value.on("blank:contextmenu", (e: MouseEvent) => {
    openContextMenu(e, ContextMenuTarget.Canvas);
  });

  paper.value.on(
    "element:contextmenu",
    (cell: RectangleImage, e: MouseEvent) => {
      // @ts-ignore
      openContextMenu(e, ContextMenuTarget.Node, cell.model.id);
    }
  );

  paper.value.on("link:contextmenu", (cell: DefaultLink, e: MouseEvent) => {
    // @ts-ignore
    openContextMenu(e, ContextMenuTarget.Link, cell.model.id);
  });

  paper.value.on(
    "blank:pointerdown element:pointerdown link:pointerdown",
    () => {
      isContextMenuOpen.value = false;
    }
  );

  paper.value.on("link:connect link:disconnect", updateGraphConfig);

  setInterval(switchAllFaces, 1e3);
});

const onGraphConfigChange = () => {
  if (!graphConfig.value || !isConfigUploaded.value) return;

  isConfigUploaded.value = false;
  graph.clear();
  facesStore.faces = [];

  graph.fromJSON(graphConfig.value);

  graphConfig.value.cells.forEach((cell) => {
    if (cell.type === "custom.RectangleImage") {
      facesStore.faces.push({
        name: cell.name,
        images: cell.images,
      });
    }
  });

  updateElements();
};

watch(graphConfig, onGraphConfigChange);

const updateGraphConfig = () => {
  graphConfig.value = graph.toJSON();
};

const updateElements = () => {
  elements.value = graph
    .getElements()
    .filter(
      (element) => element.attr("type") !== "custom.RectangleImage"
    ) as RectangleImage[];

  updateGraphConfig();
};

const createElement = (
  x: number,
  y: number,
  name: string,
  images: Array<string>
): RectangleImage => {
  facesStore.faces.push({ name, images });

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

const editFace = (faceName: string) => {
  isOpen.value = true;
  face.value = faceName;
};

const onContextMenuClick = (e: ContextMenuEvent) => {
  isContextMenuOpen.value = false;

  switch (e) {
    case ContextMenuEvent.Add:
      addNewFace();
      break;
    case ContextMenuEvent.Edit:
      editFace(contextMenuTarget.value?.prop("name"));
      break;
    case ContextMenuEvent.Delete:
      deleteFace();
      break;
    case ContextMenuEvent.Rename:
      renameFace();
      break;
  }
};

const addNewFace = () => {
  const faceName = prompt("Enter face name");
  if (!faceName) return;
  const { x, y } = contextMenuPosition.value;
  createElement(x, y, faceName, Array(2).fill(BLANK_FACE_32X16)).addTo(graph);
  updateElements();
};

const deleteFace = () => {
  if (!confirm("Are you sure?")) return;
  contextMenuTarget.value?.remove();
  facesStore.deleteFace(contextMenuTarget.value?.prop("name"));
  updateElements();
};

const renameFace = () => {
  const faceName = prompt("Enter new face name");
  if (!faceName) return;
  if (facesStore.faces.find((f) => f.name === faceName)) {
    alert("Face name is invalid");
    return;
  }

  facesStore.renameFace(contextMenuTarget.value?.prop("name"), faceName);
  contextMenuTarget.value?.rename(faceName);
  updateElements();
};

watch(
  () => facesStore.faces,
  () => {
    if (!face.value) return;
    graph.getElements().forEach((cell) => {
      if (
        cell.prop("type") === "custom.RectangleImage" &&
        cell.prop("name") === face.value
      ) {
        cell.prop(
          "images",
          facesStore.faces.find((f) => f.name === face.value)?.images
        );
      }
    });
  },
  { deep: true }
);
</script>
