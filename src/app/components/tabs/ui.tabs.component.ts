/**
 * Created by Andrey on 11/5/2017.
 */
import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren } from "@angular/core";
import { TabType, TabComponent } from "./ui.tab.component";
import { TabContentComponent } from "./ui.tabContent.component";

export interface ITabItem {
  id : number;
  type : TabType;
  database : string;
  graph : string;
}

@Component({
  moduleId: module.id,
  selector: "tabs",
  templateUrl: "ui.tabs.component.html",
  styles: [`
    :host {
      height: -webkit-fill-available;
    }
    
    .tabs-header {
      display: flex;
      flex: 0 1 32px;
    }
    
    .tabs-content {
      flex: 1 1 auto;
      height: calc(100% - 32px);
    }
  `],
})
export class TabsComponent implements OnInit, AfterViewInit {
  @Input() public items : ITabItem[] = [];

  @ViewChildren(TabComponent) public tabs : QueryList<TabComponent>;
  @ViewChildren(TabContentComponent) public windows : QueryList<TabContentComponent>;

  constructor() {
    this.items.push({id: 0, type: TabType.AQL, graph: "", database: ""});
    this.items.push({id: 1, type: TabType.Settings, graph: "", database: ""});
    this.items.push({id: 2, type: TabType.Graph, graph: "", database: ""});
  }

  public ngOnInit() {

  }

  public ngAfterViewInit() : void {
    let t = this.tabs.first;
    t.active = true;
  }

  public tabClicked(id : number) {
    this.tabs.forEach((tab) => {
      tab.active = tab.id === id;
    });
    this.windows.forEach((win) => {
      win.active = win.id === id;
    });
  }

  public tabCloseClicked(id : number) {
    let activeIndex : number;
    // deactivate all tabs
    this.tabs.forEach((tab) => {
      tab.active = false;

      // Record the current tab to be selected
      if (id === 0) {
        activeIndex = 1;
      }
      else {
        activeIndex = id - 1;
      }
    });

      // Remove the item
    this.items = this.items.filter((item) => item.id !== id);
    let counter : number = 0;

      // Activate the tab and also reset the ids of the items
    this.items.forEach((item) => {
        if (item.id === activeIndex) {
          this.tabs.forEach((t) => {
            if (t.id === item.id) {
              t.active = true;
            }
          });
        }
        item.id = counter;
        counter++;
      });

      // Reset the ids of the tabs too
    counter = 0;
    this.tabs.forEach((t) => {
        t.id = counter;
        counter++;
      });
  }
}
