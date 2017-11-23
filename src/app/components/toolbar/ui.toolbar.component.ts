import {StoreUtils} from '../../common/store';
import { Component, OnInit } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'toolbar',
    templateUrl: './ui.toolbar.component.html',
    styleUrls: ['./ui.toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
    constructor() { }

    ngOnInit() { }

    public buttonPressed(button : string) {
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