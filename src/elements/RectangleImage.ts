import { dia } from "jointjs";

export class RectangleImage extends dia.Element {
  defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type: "custom.RectangleImage",
      size: {
        width: 120,
        height: 90,
      },
      attrs: {
        body: {
          strokeWidth: 2,
          stroke: "white",
          rx: "10",
          ry: "10",
          fill: "rgb(0,90,156)",
          width: 120,
          height: 90,
          cursor: "copy",
          magnet: true,
        },
        label: {
          y: 25,
          x: 10,
          fontSize: 18,
          fill: "white",
          cursor: "move",
        },
        image: {
          x: 10,
          y: 30,
          width: 100,
          height: 50,
          imageRendering: "pixelated",
          cursor: "pointer",
          style: "filter: invert(1)",
        },
      },
    };
  }

  markup = [
    {
      tagName: "rect",
      selector: "body",
    },
    {
      tagName: "text",
      selector: "label",
    },
    {
      tagName: "image",
      selector: "image",
    },
  ];

  nextAnimationFrame(): void {
    const images = this.prop("images");
    const currentImage = this.attr("image/xlinkHref");

    this.attr("image/xlinkHref", images[currentImage === images[0] ? 1 : 0]);
  }
}
