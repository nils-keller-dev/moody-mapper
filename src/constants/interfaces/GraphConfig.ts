import type {
  AbstractedLink,
  AbstractedRectangleImage,
} from "./AbstractedElements";

export interface GraphConfig {
  cells: AbstractedRectangleImage[] | AbstractedLink[];
}
