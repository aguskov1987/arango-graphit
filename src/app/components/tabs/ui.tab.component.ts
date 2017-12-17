// Too simple to test
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { StoreUtils } from "app/common/store";

export enum TabType {
  DbAQL = 0,
  GraphAQL = 1,
  GraphExplorer = 2,
  GraphLabelMappings = 3,
  AddCollection = 4,
  AddRelation = 5,
}

@Component({
  moduleId: module.id,
  selector: "tab",
  templateUrl: "ui.tab.component.html",
  styleUrls: ["ui.tab.component.scss"],
})
export class TabComponent implements OnInit {
  @Input() public tabType : TabType;
  @Input() public id : number;
  @Input() public title : string = "";
  @Input() public icon : string = "";
  @Input() public active : boolean = false;

  @Input() public database : string = "";
  @Input() public graph : string = "";

  @Output() public clicked = new EventEmitter();
  @Output() public closeClicked = new EventEmitter();

  constructor() {
  }

  public ngOnInit() {
  }

  public tabClicked() {
    this.clicked.emit(this.id);
  }

  public tabCloseClicked() {
    this.closeClicked.emit(this.id);
  }
}
