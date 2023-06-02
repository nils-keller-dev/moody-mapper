export enum ContextMenuTarget {
  Node,
  Canvas,
  Link,
}

export enum ContextMenuEvent {
  Delete = "delete",
  Edit = "edit",
  Rename = "rename",
  Add = "add",
}

export const contextMenuEventMap = {
  [ContextMenuTarget.Node]: [
    ContextMenuEvent.Delete,
    ContextMenuEvent.Edit,
    ContextMenuEvent.Rename,
  ],
  [ContextMenuTarget.Canvas]: [ContextMenuEvent.Add],
  [ContextMenuTarget.Link]: [ContextMenuEvent.Delete],
};
