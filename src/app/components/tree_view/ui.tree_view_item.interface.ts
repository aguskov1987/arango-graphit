export enum TreeViewItemType {
  Server,
  Database,
  DocCollection,
  RelCollection,
  Graph,
  GraphVertexCollection,
  GraphRelCollection
}

export interface ITreeViewItem {
  objName: string;
  objType: TreeViewItemType;
  displayName: string;
  icon: string;
  collapsed: boolean;
  terminalNode: boolean;
  subNodes: ITreeViewItem[];
  color: string;
}
