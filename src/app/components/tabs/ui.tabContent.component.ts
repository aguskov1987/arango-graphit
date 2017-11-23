/**
 * Created by Andrey on 11/5/2017.
 */
import { Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from "@angular/core";
import { TabType } from "./ui.tab.component";
import { AqlEditorComponent } from "app/components/aql_editor/ui.aql_editor.component";

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
export class TabContentComponent implements OnInit, OnChanges {

  @Input() public id: number = 0;
  @Input() public type: TabType;
  @Input() public active: boolean = false;
  @ViewChild(AqlEditorComponent) private aqlEditor: AqlEditorComponent;

  constructor() {
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
}
