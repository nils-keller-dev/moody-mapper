<template>
  <div id="diagramDiv" class="w-full h-full" />
</template>

<script lang="ts" setup>
import { useDiagramStore } from "@/stores/diagram";
import { useEditorStore } from "@/stores/editor";
import go, { Size } from "gojs";
import { storeToRefs } from "pinia";
import { onMounted, watch, type Ref } from "vue";

const { model, nodes } = storeToRefs(useDiagramStore());
const { isOpen, face } = storeToRefs(useEditorStore());

watch(model as Ref<go.Model>, (newModel: go.Model) => {
  diagram.model = newModel;
  nodes.value = diagram.nodes;
});

let diagram: go.Diagram;

const initDiagram = () => {
  const $ = go.GraphObject.make;

  diagram = new go.Diagram("diagramDiv");

  diagram.commandHandler.doKeyDown = function () {
    const key = this.diagram.lastInput.key;
    if (key === "Backspace" || key === "Del") {
      deleteNode(this.diagram.lastInput);
      return;
    }

    go.CommandHandler.prototype.doKeyDown.call(this);
  };

  diagram.toolManager.draggingTool.isGridSnapEnabled = true;
  diagram.toolManager.draggingTool.gridSnapCellSize = new Size(160, 130);

  const editNode = async (_e: go.InputEvent, obj: go.GraphObject) => {
    isOpen.value = true;
    face.value = obj.part?.data.name;
  };

  const deleteNode = (e: go.InputEvent) => {
    if (confirm("Are you sure you want to delete this node?")) {
      e.diagram.commandHandler.deleteSelection();
    }
  };

  diagram.nodeTemplate = $(
    go.Node,
    "Auto",
    $(go.Shape, "RoundedRectangle", {
      strokeWidth: 0,
      fill: "#f3f3e3",
      portId: "",
      cursor: "pointer",
      fromLinkable: true,
      fromLinkableSelfNode: true,
      toLinkable: true,
      toLinkableSelfNode: true,
    }),
    $(go.Picture, {
      cursor: "pointer",
      name: "image",
      margin: 8,
      width: 80,
      height: 40,
    }),
    {
      toolTip: $("ToolTip", $(go.TextBlock, new go.Binding("text", "text"))),
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
      go.Point.stringify
    ),
    {
      selectionAdornmentTemplate: $(
        go.Adornment,
        "Auto",
        $(go.Shape, "RoundedRectangle", {
          fill: null,
          stroke: "dodgerblue",
          strokeWidth: 4,
        }),
        $(go.Placeholder)
      ),
    },
    {
      doubleClick: editNode,
    },
    {
      contextMenu: $(
        "ContextMenu",
        $("ContextMenuButton", $(go.TextBlock, "Edit"), {
          click: editNode,
        }),
        $("ContextMenuButton", $(go.TextBlock, "Delete"), {
          click: deleteNode,
        })
      ),
    }
  );

  const setStrokeTransparent = (_e: go.InputEvent, link: go.GraphObject) => {
    ((link as go.Link).elt(0) as go.Shape).stroke = "transparent";
  };

  diagram.linkTemplate = $(
    go.Link,
    {
      toShortLength: 3,
      relinkableFrom: true,
      relinkableTo: true,
    },
    $(go.Shape, {
      isPanelMain: true,
      stroke: "transparent",
      strokeWidth: 8,
    }),
    $(go.Shape, { isPanelMain: true }),
    $(go.Shape, { toArrow: "Triangle" }),
    $(
      go.Shape,
      { fromArrow: "BackwardTriangle" },
      new go.Binding("visible", "isBiDirectional")
    ),
    {
      mouseEnter: (_e, link: go.GraphObject) => {
        if ((link as go.Link).isSelected) return;
        ((link as go.Link).elt(0) as go.Shape).stroke = "rgba(0,90,156,0.5)";
      },
      mouseLeave: setStrokeTransparent,
      click: setStrokeTransparent,
    }
  );

  diagram.addDiagramListener("LinkDrawn", (e) => {
    diagram.model.setDataProperty(e.subject.data, "isBiDirectional", false);

    const iterator = e.subject.toNode.findLinksOutOf();
    while (iterator.next()) {
      const item = iterator.value;
      if (item.data.to === e.subject.data.from) {
        diagram.remove(e.subject);
        diagram.model.setDataProperty(item.data, "isBiDirectional", true);
      }
    }
  });

  const animatePicture = (node: go.Node, images: string[]) => {
    const picture = node.findObject("image") as go.Picture;
    const newSrc = picture.source === images[0] ? images[1] : images[0];

    picture.source = newSrc;
  };

  const animateAllPictures = () => {
    diagram.nodes.each((node: go.Node) => {
      const data = diagram.model.nodeDataArray.find((n) => n.key === node.key);
      if (data) {
        animatePicture(node, data.images);
      }
    });
  };

  setInterval(animateAllPictures, 1000);
};

onMounted(initDiagram);
</script>

<style>
#diagramDiv canvas {
  outline: none;
  background-color: white;
  filter: invert(1);
  border-radius: 20px;
}
</style>
