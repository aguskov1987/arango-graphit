import { StoreUtils } from '../../common/store';
import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() { }

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
      default:
        return;
    }
  }
}