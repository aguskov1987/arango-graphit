/**
 * Created by Andrey on 10/9/2017.
 */
import { Component, Input, OnInit } from "@angular/core";
import { ArangoService } from "../../providers/arango.service";

@Component({
  moduleId: module.id,
  selector: "table-viewer",
  templateUrl: "ui.table_viewer.component.html",
})
export class TableViewerComponent implements OnInit {
  @Input() public collection : string = "";

  private arangoService : ArangoService;
  private columns : string[] = [];

  constructor(as : ArangoService) {
    this.arangoService = as;
  }

  public ngOnInit() {
  }
}
