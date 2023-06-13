import type { GraphConfig } from "@/constants/interfaces/GraphConfig";

export const getFacesConfig = async (): Promise<GraphConfig> => {
  return (await fetch("/configs/default.json")).json();
};
