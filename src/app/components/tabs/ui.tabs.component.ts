import { Component, Input, OnInit, QueryList, ViewChildren, NgZone, isDevMode } from "@angular/core";
import * as fs from 'fs';
import { TabType, TabComponent } from "./ui.tab.component";
import { TabContentComponent } from "./ui.tabContent.component";
import { ElectronService } from "app/providers/electron.service";
import { Command } from "app/common/types/command.type";
import { StoreUtils } from "app/common/store";
import { AqlResultsView } from "app/components/toolbar/ui.toolbar.component";
import { ArangoService } from "app/providers/arango.service";
import { EventHub, Event, EventType } from "../../common/eventHub";

export interface ITabItem {
  id: number;
  type: TabType;
  active: boolean;
  database: string;
  graph: string;

  aqlResultsMode: AqlResultsView;
  tracking: boolean;
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
      height: calc(100% - 59px);
    }
  `],
})
export class TabsComponent implements OnInit {
  @Input() public items: ITabItem[] = [];

  @ViewChildren(TabComponent) public tabs: QueryList<TabComponent>;
  @ViewChildren(TabContentComponent) public windows: QueryList<TabContentComponent>;

  private electronService: ElectronService;
  private arangoService: ArangoService;
  private fileService = fs;
  private zone: NgZone;

  constructor(es: ElectronService, z: NgZone, as: ArangoService) {
    this.electronService = es;
    this.arangoService = as;
    this.zone = z;

    this.electronService.ipcRenderer.on("open_db_query_msg", (event, args) => {
      let command = args as Command;
      this.addNewTab(TabType.DbAQL, command.database, command.graph);
      this.zone.run(() => { console.log("Db AQL Tab added") });
    });
    this.electronService.ipcRenderer.on("open_graph_query_msg", (event, args) => {
      let command = args as Command;
      this.addNewTab(TabType.GraphAQL, command.database, command.graph);
      this.zone.run(() => { console.log("Graph AQL Tab added") });
    });
    this.electronService.ipcRenderer.on("open_obj_explorer_msg", (event, args) => {
      let command = args as Command;
      this.addNewTab(TabType.GraphExplorer, command.database, command.graph);
      this.zone.run(() => { console.log("Graph Explorer Tab added") });
    });
    this.electronService.ipcRenderer.on("open_label_mappings", (event, args) => {
      this.addNewTab(TabType.GraphLabelMappings, "", "");
      this.zone.run(() => { console.log("Label Mappings Tab added") });
    })

    EventHub.subscribe(this, 'handleStartTracking', EventType.StartTrackingGraph);
    EventHub.subscribe(this, 'handleEndTracking', EventType.EndTrackingGraph);
    EventHub.subscribe(this, 'handleOpenFile', EventType.OpenClicked);
  }

  public ngOnInit() {
  }

  public addNewTab(type: TabType, database: string, graph: string) {
    // Set the names of the current database and graphs
    StoreUtils.currentDatabase = StoreUtils.databases.find((db) => db.name === database);
    if (StoreUtils.currentDatabase != null) {
      StoreUtils.currentGraph = StoreUtils.currentDatabase.graphs.find((g) => g.name === graph);
    }
    
    this.items.forEach((item) => item.active = false);

    let nextTabId = this.items.length < 1 ? 0 : this.items.length;
    this.items.push({
      id: nextTabId,
      type: type,
      graph: graph,
      database: database,
      active: true,
      aqlResultsMode: AqlResultsView.Json,
      tracking: false,
    });
    this.zone.run(() => { console.log("Tab added") });
    EventHub.emit(new Event(EventType.TabClicked, this.items[this.items.length - 1]))
  }

  public tabClicked(id: number) {
    this.items.forEach((item) => {
      item.active = item.id === id;
      if (item.active) {
        EventHub.emit(new Event(EventType.TabClicked, item))

        StoreUtils.currentDatabase = StoreUtils.databases.find((db) => db.name === item.database);
        if (StoreUtils.currentDatabase != null) {
          StoreUtils.currentGraph = StoreUtils.currentDatabase.graphs.find((g) => g.name === item.graph);
        }
      }
    });

    if (isDevMode) {
      console.log('current database', StoreUtils.currentDatabase);
      console.log('current graph', StoreUtils.currentGraph);
    }
  }

  public tabCloseClicked(id: number) {
    // Notify the arango service so it would re-adjust the tracking records
    this.arangoService.tabClosed(id);
    // deactivate all tabs
    this.items.forEach((item) => item.active = false);
    if (this.items.length === 1) {
      EventHub.emit(new Event(EventType.TabsClosed));
    }

    if (id === 0 && this.items.length > 1) {
      this.items[1].active = true;
      EventHub.emit(new Event(EventType.TabClicked, this.items[1]));
    }
    else if (id > 0 && this.items.length > 1) {
      this.items[id - 1].active = true;
      EventHub.emit(new Event(EventType.TabClicked, this.items[id - 1]));
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

  private handleOpenFile() {
    let filename = this.electronService.ipcRenderer.sendSync("openLoadFileDialog");
    if (filename && filename.length == 1) {
      this.fileService.readFile(filename[0], (error, data) => {
        this.addNewTab(TabType.GraphAQL, "", "")
        window.setTimeout(() => {
          EventHub.emit(new Event(EventType.AqlPopulation, {text: data.toString(), path: filename}))
        }, 500);
      })
    }
  }

  private handleStartTracking(event: any) {
    let args = event as any;
    if (this.items.length && this.items.length > 0) {
      this.items.find((item) => item.id === args.id).active = true;
    }
  }

  private handleEndTracking(event: any) {
    let args = event as any;
    if (this.items.length && this.items.length > 0) {
      this.items.find((item) => item.id === args.id).active = false;
    }
  }
}
