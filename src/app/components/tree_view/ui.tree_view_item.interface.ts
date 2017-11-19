
export interface ITreeViewItem {
  obj : any;
  displayName : string;
  icon : string;
  collapsed : boolean;
  terminalNode : boolean;
  subNodes : ITreeViewItem[];
  color : string;
}
