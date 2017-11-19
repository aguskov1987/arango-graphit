/**
 * Created by Andrey on 10/28/2017.
 */
import { Component, EventEmitter, Inject, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { ITreeViewItem } from "./ui.tree_view_item.interface";

@Component({
  moduleId: module.id,
  selector: "tree-view-node",
  templateUrl: "ui.tree_view_node.component.html",
  styles: [`
    .node {
      color: lightgrey;
      cursor: pointer;
      padding-top: 3px;
      font-size: smaller;
    }

    .node-selected {
      background-color: #343434;
    }
    
    .node-type {
      display: inline;
      padding-right: 5px;
    }

    .sub-nodes {
      margin-left: 1em;
    }
  `],
})
export class TreeViewNodeComponent implements OnInit {

  @Input() public item : ITreeViewItem = null;
  @Output() public clicked = new EventEmitter();
  @Output() public contextmenu = new EventEmitter();

  public selected : boolean = false;
  public instance = this;
  @Input() public parent : TreeViewNodeComponent = null;

  @ViewChildren(TreeViewNodeComponent) private subNodes : QueryList<TreeViewNodeComponent>;

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

  public contextMenuClicked() {
    this.contextmenu.emit(this);
  }

  public deselectAll() {
    this.selected = false;
    if (this.subNodes.length && this.subNodes.length > 0) {
      this.subNodes.forEach((sub) => sub.deselectAll());
    }
  }

  public selectNode(node : ITreeViewItem) {
    if (this.item === node) {
      this.selected = true;
    }
    else if (!this.item.terminalNode) {
      this.subNodes.forEach((sub) => sub.selectNode(node));
    }
  }

  public passClickAlong(node : TreeViewNodeComponent) {
    this.clicked.emit(node);
  }

  public passContextAlong(node : TreeViewNodeComponent) {
    this.contextmenu.emit(node);
  }
}
