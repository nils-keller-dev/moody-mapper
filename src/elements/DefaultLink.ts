import { dia } from "jointjs";

export class DefaultLink extends dia.Link {
  defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type: "custom.DefaultLink",
      size: {
        width: 120,
        height: 90,
      },
      attrs: {
        line: {
          connection: true,
          stroke: "white",
          strokeWidth: 2,
          targetMarker: {
            type: "path",
            d: "M 10 -5 0 0 10 5 z",
          },
          cursor: "pointer",
        },
        wrapper: {
          connection: true,
          strokeWidth: 10,
          stroke: "transparent",
          cursor: "pointer",
        },
      },
    };
  }

  markup = [
    {
      tagName: "path",
      selector: "wrapper",
    },
    {
      tagName: "path",
      selector: "line",
    },
  ];
}
