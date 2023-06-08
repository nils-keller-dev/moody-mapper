import { ContextMenuTarget } from "@/constants/enums/ContextMenuEvent";
import { ref } from "vue";

export const useContextMenu = () => {
  const isContextMenuOpen = ref(false);
  const contextMenuPosition = ref({ x: 0, y: 0 });
  const contextMenuTargetId = ref("");
  const contextMenuTargetType = ref(ContextMenuTarget.Canvas);

  const openContextMenu = (
    e: MouseEvent,
    targetType: ContextMenuTarget,
    id = ""
  ) => {
    isContextMenuOpen.value = true;
    contextMenuPosition.value = { x: e.clientX, y: e.clientY };
    contextMenuTargetId.value = id;
    contextMenuTargetType.value = targetType;
  };

  const closeContextMenu = () => {
    isContextMenuOpen.value = false;
  };

  return {
    isContextMenuOpen,
    contextMenuPosition,
    contextMenuTargetId,
    contextMenuTargetType,
    openContextMenu,
    closeContextMenu,
  };
};
