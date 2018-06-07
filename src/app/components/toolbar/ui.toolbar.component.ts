import { StoreUtils } from '../../common/store';
import { Component, OnInit } from '@angular/core';
import { TabType } from 'app/components/tabs/ui.tab.component';
import { Event, EventHub, EventType } from '../../common/eventHub';
import { ElectronService } from '../../providers/electron.service';

export enum AqlResultsView {
  Table,
  Json
}

enum ButtonState {
  Disabled = 0,
  Default = 1,
  On = 2
}

@Component({
  moduleId: module.id,
  selector: 'toolbar',
  templateUrl: './ui.toolbar.component.html',
  styleUrls: ['./ui.toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  private currentTabId: number;
  private currentTabType: TabType;

  public connectToServer: ButtonState = ButtonState.Default;
  public open: ButtonState = ButtonState.Default;
  public save: ButtonState = ButtonState.Default;
  public saveAll: ButtonState = ButtonState.Default;
  public cut: ButtonState = ButtonState.Default;
  public copy: ButtonState = ButtonState.Default;
  public paste: ButtonState = ButtonState.Default;
  public run: ButtonState = ButtonState.Default;
  public tableView: ButtonState = ButtonState.Default;
  public objView: ButtonState = ButtonState.Default;
  public startTrack: ButtonState = ButtonState.Default;
  public endTrack: ButtonState = ButtonState.Default;

  constructor(es: ElectronService) {
    EventHub.subscribe(this, 'tabClickedHandler', EventType.TabClicked);
    EventHub.subscribe(this, 'tabsClosedHandler', EventType.TabsClosed)
  }

  tabClickedHandler(event: any) {
    let args = event as any;
    this.currentTabId = args.id;
    this.currentTabType = args.type;
    if (args.type === 0 || args.type === 1) {
      this.aqlTabClicked(args.aqlResultsMode);
    }
    if (args.type === 2) {
      this.graphTabClicked(args.tracking);
    }
    if (args.type === 3) {
      this.labelTabClicked();
    }
  }

  tabsClosedHandler() {
    this.disableAql();
    this.disableClipboard();
    this.disableTracking();
  }

  ngOnInit() {
    this.disableAql();
    this.disableClipboard();
    this.disableTracking();
  }

  public aqlTabClicked(mode: AqlResultsView) {
    this.enableClipboard();
    this.enableAql();
    this.disableTracking();

    if (mode === AqlResultsView.Table) {
      this.objView = ButtonState.Default;
      this.tableView = ButtonState.On;
    }
    else {
      this.objView = ButtonState.On;
      this.tableView = ButtonState.Default;
    }
  }

  public graphTabClicked(tracking: boolean) {
    this.disableClipboard();
    this.disableAql();
    this.enableTracking();

    if (tracking) {
      this.startTrack = ButtonState.On;
    }
  }

  public labelTabClicked() {
    this.disableAql();
    this.disableClipboard();
    this.disableTracking();
  }

  public disableClipboard() {
    this.cut = ButtonState.Disabled;
    this.copy = ButtonState.Disabled;
    this.paste = ButtonState.Disabled;
  }

  public disableAql() {
    this.run = ButtonState.Disabled;
    this.tableView = ButtonState.Disabled;
    this.objView = ButtonState.Disabled;
  }

  public disableTracking() {
    this.startTrack = ButtonState.Disabled;
    this.endTrack = ButtonState.Disabled;
  }
 
  public enableClipboard() {
    this.cut = ButtonState.Default;
    this.copy = ButtonState.Default;
    this.paste = ButtonState.Default;
  }

  public enableAql() {
    this.run = ButtonState.Default;
    this.tableView = ButtonState.Default;
    this.objView = ButtonState.Default;
  }

  public enableTracking() {
    this.startTrack = ButtonState.Default;
    this.endTrack = ButtonState.Default;
  }

  public buttonPressed(button: string) {
    switch (button) {
      case "run_query":
        StoreUtils.globalEventEmitter.emit(StoreUtils.query_run_clicked);
        break;
      case "comment_code":
        StoreUtils.globalEventEmitter.emit(StoreUtils.comment_code_clicked);
        break;
      case "start_tracking":
        if (this.startTrack === ButtonState.Default) {
          EventHub.emit(new Event(EventType.StartTrackingGraph, {id: this.currentTabId}));
          this.startTrack = ButtonState.On;  
        }
        break;
      case "end_tracking":
        if (this.startTrack === ButtonState.On) {
          EventHub.emit(new Event(EventType.EndTrackingGraph, {id: this.currentTabId}));
          this.startTrack = ButtonState.Default;
        }
        break;
      case "save":
        EventHub.emit(new Event(EventType.SaveClicked))
      case "open_file":
        EventHub.emit(new Event(EventType.OpenClicked))
      default:
        return;
    }
  }
}