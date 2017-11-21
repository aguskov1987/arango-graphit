/**
 * Created by Andrey on 10/28/2017.
 */
import { Component, EventEmitter, Inject, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ITreeViewItem } from "./ui.tree_view_item.interface";

export class RightClickEventArgs {
  component: TreeViewNodeComponent;
  mouseX: number;
  mouseY: number;
}

@Component({
  moduleId: module.id,
  selector: "tree-view-node",
  templateUrl: "ui.tree_view_node.component.html",
  styleUrls: ["ui.tree_view_node.component.scss"]
})
export class TreeViewNodeComponent implements OnInit {

  @Input() public item: ITreeViewItem = null;
  @Output() public clicked = new EventEmitter();
  @Output() public contextmenu = new EventEmitter();

  public selected: boolean = false;
  public instance = this;
  @Input() public parent: TreeViewNodeComponent = null;

  @ViewChildren(TreeViewNodeComponent) private subNodes: QueryList<TreeViewNodeComponent>;

  constructor() {
  }

  public ngOnInit() {
  }

  public openOrCollapse() {
    this.item.collapsed = !this.item.collapsed;
  }

  public nodeClicked() {
    this.clicked.emit(this.item);
  }

  public contextMenuClicked(event) {
    let args: RightClickEventArgs = { component: this, mouseX: event.clientX, mouseY: event.clientY };
    this.contextmenu.emit(args);
  }

  public deselectAll() {
    this.selected = false;
    if (this.subNodes.length && this.subNodes.length > 0) {
      this.subNodes.forEach((sub) => sub.deselectAll());
    }
  }

  public selectNode(node: ITreeViewItem) {
    if (this.item === node) {
      this.selected = true;
    }
    else if (!this.item.terminalNode) {
      this.subNodes.forEach((sub) => sub.selectNode(node));
    }
  }

  public passClickAlong(args: ITreeViewItem) {
    this.clicked.emit(args);
  }

  public passContextAlong(args: any) {
    this.contextmenu.emit(args);
  }
}
