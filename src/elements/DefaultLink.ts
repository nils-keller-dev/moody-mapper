import * as joint from "jointjs";

export class DefaultLink extends joint.shapes.standard.Link {
  constructor(attributes?: joint.shapes.standard.LinkAttributes) {
    super({
      ...attributes,
      attrs: {
        line: { stroke: "white" },
      },
    });
  }
}
