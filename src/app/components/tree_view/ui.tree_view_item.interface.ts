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
  obj: any;
  objType: TreeViewItemType;
  displayName: string;
  icon: string;
  collapsed: boolean;
  terminalNode: boolean;
  subNodes: ITreeViewItem[];
  color: string;
}
