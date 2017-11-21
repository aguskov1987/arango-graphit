import {ElectronService} from '../../providers/electron.service';
/**
 * Created by Andrey on 10/28/2017.
 */
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ITreeViewItem } from "./ui.tree_view_item.interface";
import { TreeViewNodeComponent } from "./ui.tree_view_node.component";

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
  @Input() public root : ITreeViewItem = null;
  @ViewChild(TreeViewNodeComponent) public treeView : TreeViewNodeComponent;
  @Output() public nodeRightClicked = new EventEmitter();

  private electronService : ElectronService;

  constructor(es : ElectronService) {
    this.electronService = es;
  }

  public ngOnInit() {
  }

  public click(node : ITreeViewItem) {
    this.treeView.deselectAll();
    this.treeView.selectNode(node);
  }

  public contextmenu(node : TreeViewNodeComponent) {
    this.treeView.deselectAll();
    this.treeView.selectNode(node.item);
    this.electronService.ipcRenderer.send("graphRightClicked", node.item);
  }
}
