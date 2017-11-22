import { ElectronService } from "../../providers/electron.service";
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ITreeViewItem, TreeViewItemType } from "./ui.tree_view_item.interface";
import { TreeViewNodeComponent, TreeRightClickEventArgs } from "./ui.tree_view_node.component";
import { Command, CommandType } from "app/common/types/command.type";

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

  public contextmenu(args: TreeRightClickEventArgs) {
    this.treeView.deselectAll();

    if (args.item != null) {
      this.treeView.selectNode(args.item);

      if (args.item.objType === TreeViewItemType.Graph) {
        let command: Command = new Command();
        command.commandType = CommandType.OpenNewGraphAqlTab;
        command.graph = args.item.objName;
        command.database = args.parent.objName;
        this.electronService.ipcRenderer
          .send("graphRightClicked", { command: command, x: args.mouseX, y: args.mouseY });
      }
      else if (args.item.objType === TreeViewItemType.Database) {
        let command: Command = new Command();
        command.commandType = CommandType.OpenNewDbAqlTab;
        command.database = args.item.objName;
        command.graph = "";
        this.electronService.ipcRenderer
          .send("dbRightClicked", { command: command, x: args.mouseX, y: args.mouseY });
      }
    }
  }
}
