export enum ContextMenuTarget {
  Node,
  Canvas,
  Link,
}

export enum ContextMenuEvent {
  Delete = "Delete",
  Edit = "Edit",
  Rename = "Rename",
  Add = "Add",
}

export const contextMenuEventMap = {
  [ContextMenuTarget.Node]: [
    ContextMenuEvent.Edit,
    ContextMenuEvent.Rename,
    ContextMenuEvent.Delete,
  ],
  [ContextMenuTarget.Canvas]: [ContextMenuEvent.Add],
  [ContextMenuTarget.Link]: [ContextMenuEvent.Delete],
};
