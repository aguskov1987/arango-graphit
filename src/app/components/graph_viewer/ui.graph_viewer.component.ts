import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { ArangoService, IDbChange } from "../../providers/arango.service";
import * as chroma from "chroma-js";
import { StoreUtils } from "app/common/store";
import * as df from "deep-diff";

@Component({
  moduleId: module.id,
  selector: "graph-viewer",
  templateUrl: "ui.graph_viewer.component.html",
  styles: [`
    .cytoscape-container {
      height: 100%;
      width: 100%;
    }
    .preview {
      position: fixed;
      background-color: #1E1E1E;
      width: 500px;
      border: 1px solid #aba6a5;
      max-height: 400px;
      overflow: auto;
      padding: 0.5em;
    }
  `],
})
export class GraphViewerComponent implements OnInit {
  @Input() id: number = 0;

  private arangoServer: ArangoService;
  private data: any;
  private cytoscapeContext: any;
  private tracking: boolean = false;
  private dbChanges: IDbChange[] = [];

  private nodeId: string;
  private dir: string;
  private depth: number;
  private rootId: string;

  public previewPosition: [string, string] = ["-600px", "-600px"];
  public previewObject: any[] = [];

  constructor(aService: ArangoService) {
    this.arangoServer = aService;

    StoreUtils.globalEventEmitter.on(StoreUtils.start_tracking_clicked, (event) => {
      let args = event as any;
      if (this.id === args.id) {
      }
    });
  }

  public ngOnInit() {
  }

  public showGraph(nodeId: string, dir: string, depth: number, label: string) {
    this.nodeId = nodeId;
    this.dir = dir;
    this.depth = depth;

    let docsCall = this.arangoServer.loadObjectGraphNodes(nodeId, dir, depth);
    let relsCall = this.arangoServer.loadObjectGraphRels(nodeId, dir, depth);
    let rootCall = this.arangoServer.loadDocumentById(nodeId);

    Promise.all([docsCall, relsCall, rootCall]).then((response) => {
      let docsCursor = response[0];
      let relsCursor = response[1];
      let root = response[2] as any;

      this.data = [];
      this.data.push({ data: { id: root._id.replace("/", "_"), group: root._id.split("/")[0], document: root } });
      this.rootId = this.data[0].data.id;
      docsCursor.all().then((docs) => {
        docs.forEach((doc) => {
          if (doc != null) {
            let node = { data: { id: doc._id.replace("/", "_"), group: doc._id.split("/")[0], document: doc } };
            this.data.push(node);
          }
        });

        relsCursor.all().then((rels) => {
          rels.forEach((rel) => {
            if (rel != null) {
              let link = { data: { source: rel._from.replace("/", "_"), target: rel._to.replace("/", "_"), id: rel._id.replace("/", "_"), relation: rel } };
              this.data.push(link);
            }
          });

          this.addColors();
          
          let cts = require("cytoscape");
          let cytoscape = cts({
            container: document.getElementById("cytoscapeContainer" + this.id),
            elements: this.data,
            style: [ // the stylesheet for the graph
              {
                selector: 'node',
                style: {
                  "color": "white",
                  "font-size": 10,
                  "background-color": "data(color)",
                  "label": "data(document.doctype)",
                  "border-width": "1px",
                  "border-style": "solid",
                  "border-color": "white",
                  "width": "20px",
                  "height": "20px"
                }
              },
              {
                selector: 'node:selected',
                style: {
                  "color": "red",
                  "font-size": 10,
                  "background-color": "data(color)",
                  "label": "data(document.doctype)",
                  "border-width": "1px",
                  "border-style": "solid",
                  "border-color": "red",
                  "width": "20px",
                  "height": "20px"
                }
              },
              {
                selector: 'edge',
                style: {
                  'width': 1,
                  'line-color': '#ccc',
                  'mid-target-arrow-color': '#ccc',
                  'mid-target-arrow-shape': 'triangle',
                }
              },
              {
                selector: 'edge:selected',
                style: {
                  'width': 1,
                  'line-color': 'red',
                  'mid-target-arrow-color': 'red',
                  'mid-target-arrow-shape': 'triangle',
                }
              }
            ],

            layout: {
              name: 'cose',
              padding: 50,
              componentSpacing: 100
            }
          });
          this.cytoscapeContext = cytoscape;

          this.cytoscapeContext.on("click", "*", (event) => {
            this.previewObject = event.target.data().document != null ? event.target.data().document
              : event.target.data().relation;

            let top = event.originalEvent.clientY + "px";
            let left = event.originalEvent.clientX + "px";
            this.previewPosition = [top, left];
          });
        });
      });
    });
  }

  private addColors(): void {
    // Create color scale
    let groups: string[] = this.data.filter((el) => el.data.group != null).map((el) => el.data.group);
    let uniqueGroups: Set<string> = new Set();
    groups.forEach((g) => uniqueGroups.add(g));
    let colors = chroma.scale(["#6FB3F1", "#FE955C", "#FAFA6E"]).mode("lch").colors(uniqueGroups.size);
    let colorMaps: [string, string][] = [];
    let counter: number = 0;
    uniqueGroups.forEach((g) => {
      colorMaps.push([g, colors[counter]]);
      counter++;
    });
    this.data.forEach(element => {
      if (element.data.group == null) {
        return;
      }
      let color = colorMaps.find((map) => map[0] === element.data.group)[1];
      element.data.color = color;
    });
  }

  private updateGraph() {
    this.arangoServer.stopTrackingGraph(0).subscribe((changes) => {
      this.dbChanges = changes;
      this.updateDocs();
    });
  }

  private updateDocs() {
    for (let d of this.data) {
      let id = d.data.id.replace("_", "/");
      for (let change of this.dbChanges) {
        if (change.type === 2300 && change.data._id === id) {
          let original = this.cytoscapeContext.getElementById(d.data.id);
          let difference;
          if (original.data().document != null) {
            difference = df.default.diff(original.data().document, change.data);
          }
          else {
            difference = df.default.diff(original.data().relation, change.data);
          }
          original.data().changes = difference;
        }
      }
    }
  }
}
