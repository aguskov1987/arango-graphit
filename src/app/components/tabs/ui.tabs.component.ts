import { AfterViewInit, Component, Input, OnInit, QueryList, ViewChildren, NgZone } from "@angular/core";

import { TabType, TabComponent } from "./ui.tab.component";
import { TabContentComponent } from "./ui.tabContent.component";
import { ElectronService } from "app/providers/electron.service";
import { Command } from "app/common/types/command.type";
import { StoreUtils } from "app/common/store";

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
  private zone: NgZone;

  constructor(es: ElectronService, z: NgZone) {
    this.electronService = es;
    this.zone = z;

    this.electronService.ipcRenderer.on("open_db_query_msg", (event, args) => {
      let command = args as Command; 
      this.addNewTab(TabType.DbAQL, command.database, command.graph);
      this.zone.run(() => {console.log("Db AQL Tab added")});
    });
    this.electronService.ipcRenderer.on("open_graph_query_msg", (event, args) => {
      let command = args as Command;
      this.addNewTab(TabType.GraphAQL, command.database, command.graph);
      this.zone.run(() => {console.log("Graph AQL Tab added")});
    });
  }

  public ngOnInit() {
  }

  public addNewTab(type: TabType, database: string, graph: string) {
    this.items.forEach((item) => item.active = false);

    let nextTabId = this.items.length < 1 ? 0 : this.items.length;
    this.items.push({id: nextTabId, type: type, graph: graph, database: database, active: true});

    // Set the names of the current database and graphs
    StoreUtils.currentDatabase = StoreUtils.databases.find((db) => db.name === database);
    StoreUtils.currentGraph = StoreUtils.currentDatabase.graphs.find((g) => g.name === graph);
  }

  public tabClicked(id : number) {
    this.items.forEach((item) => {
      item.active = item.id === id;
      if (item.active) {
        StoreUtils.currentDatabase = StoreUtils.databases.find((db) => db.name === item.database);
        StoreUtils.currentGraph = StoreUtils.currentDatabase.graphs.find((g) => g.name === item.graph);
      }
    });
  }

  public tabCloseClicked(id : number) {
    console.log(this.items, id);
    // deactivate all tabs
    this.items.forEach((item) => item.active = false);

    if (id === 0 && this.items.length > 1) {
      this.items[1].active = true;
    }
    else if (id > 0 && this.items.length > 1) {
      this.items[id - 1].active = true;
    }

    // Remove the item
    this.items = this.items.filter((item) => item.id !== id);

    // Reset the ids of the tabs and windows too
    let counter: number = 0;
    this.items.forEach((item) => {
        item.id = counter;
        counter++;
      });
  }
}
