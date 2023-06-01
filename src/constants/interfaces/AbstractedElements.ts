export interface AbstractedRectangleImage {
  type: "custom.RectangleImage";
  id: string;
  name: string;
  images: string[];
}

export interface AbstractedLink {
  type: "standard.Link";
  id: string;
  source: {
    id: string;
  };
  target: {
    id: string;
  };
}
