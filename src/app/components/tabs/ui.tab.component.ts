/**
 * Created by Andrey on 11/5/2017.
 */
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

export enum TabType {
  DbAQL,
  GraphAQL,
  GraphExplorer,
  Settings,
  AddCollection,
  AddRelation,
}

@Component({
  moduleId: module.id,
  selector: "tab",
  templateUrl: "ui.tab.component.html",
  styles: [`
    .tab {
      display: flex;
      height: 30px;
      line-height: 30px;
      width: 120px;
      background-color: #3C3E3F;
      color: white;
      font-size: smaller;
      font-weight: 200;
      margin-top: 1px;
      margin-left: 1px;
      cursor: default;
      -webkit-user-select: none;
    }

    .tab:hover {
      background-color: #515658;
    }

    .tab-active {
      background-color: #515658;
      height: 27px;
      border-bottom: solid 3px #4e84ed;
    }

    img {
      padding-top: 5px;
      padding-right: 2px;
      image-rendering: -webkit-optimize-contrast;
    }
    
    .close {
      margin-right: 5px;
      margin-left: auto;
      font-weight: 100;
    }
  `],
})
export class TabComponent implements OnInit {
  @Input() public tabType : TabType;
  @Input() public id : number;
  @Input() public title : string = "";
  @Input() public icon : string = "";
  @Input() public active : boolean = false;

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
