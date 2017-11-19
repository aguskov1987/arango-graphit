/**
 * Created by Andrey on 11/12/2017.
 */
import { Component, OnInit, ViewChild } from "@angular/core";
import { GraphViewerComponent } from "../graph_viewer/ui.graph_viewer.component";

@Component({
  moduleId: module.id,
  selector: "graph-obj-explorer",
  templateUrl: "graph_obj_explorer.component.html",
  styles: [`
    .d3-container {
      width: 100%;
      height: 100%;
    }
    
    .params {
      padding-left: 35%;
      padding-top: 12%;
    }
    
    .header {
      color: whitesmoke;
      font-weight: 100;
      font-size: smaller;
    }
    
    .spacer {
      height: 1em;
    }
  `],
})
export class GraphObjExplorerComponent implements OnInit {
  public showParameters : boolean = true;
  public nodeId : string = "";
  public edgeDir : string = "ANY";
  public depth : number = 5;
  public label : string = "";

  @ViewChild(GraphViewerComponent) public graphViewer : GraphViewerComponent;

  constructor() {
  }

  public ngOnInit() {
  }

  public submit() {
    this.graphViewer.showGraph(this.nodeId, this.edgeDir, this.depth, this.label);
  }
}
