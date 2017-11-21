import { ElectronService } from "../../providers/electron.service";
/**
 * Created by Andrey on 10/28/2017.
 */
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ITreeViewItem, TreeViewItemType } from "./ui.tree_view_item.interface";
import { TreeViewNodeComponent, RightClickEventArgs } from "./ui.tree_view_node.component";
import { NewTabArgs } from "app/common/types/new_tab_args";

/***
 * Top-level component for Tree View. To use, insert a root object into the component.
 * The root object must implement ITreeViewNode interface
 */
@Component({
  moduleId: module.id,
  selector: "tree-view",
  templateUrl: "ui.tree_view.component.html",
})
export class TreeViewComponent implements OnInit {
  @Input() public root: ITreeViewItem = null;
  @ViewChild(TreeViewNodeComponent) public treeView: TreeViewNodeComponent;
  @Output() public nodeRightClicked = new EventEmitter();

  private electronService: ElectronService;

  constructor(es: ElectronService) {
    this.electronService = es;
  }

  public ngOnInit() {
  }

  public click(node: ITreeViewItem) {
    this.treeView.deselectAll();
    this.treeView.selectNode(node);
  }

  public contextmenu(args: RightClickEventArgs) {
    this.treeView.deselectAll();
    if (args.component != null) {
      this.treeView.selectNode(args.component.item);
      if (args.component.item.objType === TreeViewItemType.Graph) {
        this.electronService.ipcRenderer
          .send("graphRightClicked", { argument: args.component.item, x: args.mouseX, y: args.mouseY });
      }
      else if (args.component.item.objType === TreeViewItemType.Database) {
        let params: NewTabArgs = new NewTabArgs();
        params.dbName = args.component.item.displayName;
        params.graphName = "";
        this.electronService.ipcRenderer
          .send("dbRightClicked", { argument: params, x: args.mouseX, y: args.mouseY });
      }
    }
  }
}
