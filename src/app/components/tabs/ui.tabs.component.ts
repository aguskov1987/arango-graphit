import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren } from "@angular/core";

import { TabType, TabComponent } from "./ui.tab.component";
import { TabContentComponent } from "./ui.tabContent.component";
import { ElectronService } from "app/providers/electron.service";

export interface ITabItem {
  id : number;
  type : TabType;
  active: boolean;
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
export class TabsComponent implements OnInit {
  @Input() public items : ITabItem[] = [];

  @ViewChildren(TabComponent) public tabs : QueryList<TabComponent>;
  @ViewChildren(TabContentComponent) public windows : QueryList<TabContentComponent>;

  private electronService: ElectronService;

  constructor(es: ElectronService) {
    this.electronService = es;
    this.electronService.ipcRenderer.on("open_db_query_msg", (event, args) => {
      console.log(args);
      this.addNewTab(TabType.DbAQL, args.params.dbName, args.params.graphName);
    });
  }

  public ngOnInit() {
  }

  public addNewTab(type: TabType, database: string, graph: string) {
    this.items.forEach((item) => item.active = false); 

    let nextTabId = this.items.length < 1 ? 0 : this.items[this.items.length - 1].id + 1;
    this.items.push({id: nextTabId, type: type, graph: graph, database: database, active: true});
  }

  public tabClicked(id : number) {
    this.items.forEach((item) => {
      item.active = item.id === id;
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

      // Reset the ids of the tabs and windows too
    counter = 0;
    this.tabs.forEach((t) => {
        t.id = counter;
        counter++;
      });
    counter = 0;
    this.windows.forEach((w) => {
      w.id = counter;
      counter++;
    })
  }
}
