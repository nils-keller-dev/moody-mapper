<template>
  <div id="diagramDiv" />
</template>

<script lang="ts" setup>
import { useDiagramStore } from "@/stores/diagram";
import go from "gojs";
import { storeToRefs } from "pinia";
import { onMounted, watch } from "vue";

const { model, nodes } = storeToRefs(useDiagramStore());

watch(model, (newModel) => {
  diagram.model = newModel;
  nodes.value = diagram.nodes;
});

let diagram: any;

const initDiagram = () => {
  const $ = go.GraphObject.make;

  diagram = $(go.Diagram, "diagramDiv", {
    "undoManager.isEnabled": true,
  });

  diagram.toolManager.draggingTool.isGridSnapEnabled = true;

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
    }
  );

  const setStrokeTransparent = (_e, link) => {
    link.elt(0).stroke = "transparent";
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
      mouseEnter: (_e, link) => {
        if (link.isSelected) return;
        link.elt(0).stroke = "rgba(0,90,156,0.5)";
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

  const animatePicture = (node, images) => {
    const picture = node.findObject("image");
    const newSrc = picture.source === images[0] ? images[1] : images[0];
    picture.source = newSrc;
  };

  const animateAllPictures = () => {
    diagram.nodes.each((node: any) => {
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
#diagramDiv {
  width: 100%;
  height: 100%;
}

canvas {
  outline: none;
  background-color: white;
  filter: invert(1);
  border-radius: 20px;
}
</style>
