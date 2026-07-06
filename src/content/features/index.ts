import { copyButtonsFeature } from "./copyButtons";
import { promptCollapseFeature } from "./promptCollapse";
import { promptRawFeature } from "./promptRaw";
import { sidebarHistoryFeature } from "./sidebarHistory";
import type { Feature } from "./types";

export const features: Feature[] = [
  promptRawFeature,
  copyButtonsFeature,
  promptCollapseFeature,
  sidebarHistoryFeature
];