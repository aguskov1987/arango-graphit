/**
 * Created by Andrey on 11/5/2017.
 */
import { Component, Input, OnInit } from "@angular/core";
import { TabType } from "./ui.tab.component";

@Component({
  moduleId: module.id,
  selector: "tab-content",
  templateUrl: "ui.tabContent.component.html",
  styles: [`
    .content {
      height: 100%;
    }
  `],
})
export class TabContentComponent implements OnInit {
  @Input() public id : number = 0;
  @Input() public type : TabType;
  @Input() public active : boolean = false;

  constructor() {
  }

  public ngOnInit() {
  }

}
