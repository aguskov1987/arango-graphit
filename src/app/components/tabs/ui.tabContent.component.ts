import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from "@angular/core";
import {SelectItem} from 'primeng/primeng';

import { TabType } from "./ui.tab.component";
import { AqlEditorComponent } from "app/components/aql_editor/ui.aql_editor.component";
import { StoreUtils } from "../../common/store";
import { EventHub, EventType, Event } from "../../common/eventHub";

@Component({
  moduleId: module.id,
  selector: "tab-content",
  templateUrl: "ui.tabContent.component.html",
  styles: [`
    .content {
      height: 100%;
      background-color: #2b2b2b;
    }
    .datasource {
      color: whitesmoke;
      font-weight: 100;
      font-size: smaller;
      padding: 5px;
    }
  `],
})
export class TabContentComponent implements OnInit, OnChanges {

  @Input() public id: number = 0;
  @Input() public type: TabType;
  @Input() public active: boolean = false;
  @Input() public database = null;
  @Input() public graph = null;
  @ViewChild(AqlEditorComponent) private aqlEditor: AqlEditorComponent;

  public databases = [];
  public graphs = [];

  constructor() {
    this.databases = StoreUtils.databases.map(db => {return {label: db.name, value: db.name}});
    this.graphs = StoreUtils.currentDatabase.graphs.map(g => {return {label: g.name, value: g.name}});
  }

  public ngOnInit() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // activate the editor if the user switches to the tab
    if (changes.active != null && changes.active.previousValue === false && changes.active.currentValue === true && this.aqlEditor != null) {
      this.aqlEditor.focusOnEditor();
    }
    // activate the editor if the user opens a new tab
    else if (changes.type != null && changes.type.previousValue == null && changes.type.currentValue != null) {
      window.setTimeout(() => {
        if (this.aqlEditor != null) {
          this.aqlEditor.focusOnEditor();
        }
      }, 1000)
    }
  }

  public onDbChange(db) {
    StoreUtils.currentDatabase = StoreUtils.databases.find((d) => d.name === db);
    this.graphs = StoreUtils.currentDatabase.graphs.map(g => {return {label: g.name, value: g.name}});
    EventHub.emit(new Event(EventType.DbOrGraphUpdatedInTabContennt, {id: this.id, database: db, graph: this.graph}))
  }

  public onGraphChange(gr) {
    StoreUtils.currentGraph = StoreUtils.currentDatabase.graphs.find((g) => g.name === gr);
    EventHub.emit(new Event(EventType.DbOrGraphUpdatedInTabContennt, {id: this.id, database: this.database, graph: gr}))
  }
}
