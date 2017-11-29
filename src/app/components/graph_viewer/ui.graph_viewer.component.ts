import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { ArangoService } from "../../providers/arango.service";
import * as chroma from "chroma-js";

@Component({
  moduleId: module.id,
  selector: "graph-viewer",
  templateUrl: "ui.graph_viewer.component.html",
  styles: [`
    .cytoscape-container {
      height: 100%;
      width: 100%;
    }
  `],
})
export class GraphViewerComponent implements OnInit {
  @Input() id: number = 0;
  @Output() public linkHovered = new EventEmitter();
  @Output() public nodeHovered = new EventEmitter();
  @Output() public linkOut = new EventEmitter();
  @Output() public nodeOut = new EventEmitter();

  private arangoServer: ArangoService;
  private data: any;

  constructor(aService: ArangoService) {
    this.arangoServer = aService;
  }

  public ngOnInit() {
  }

  public showGraph(nodeId: string, dir: string, depth: number, label: string) {
    let docsCall = this.arangoServer.loadObjectGraphNodes(nodeId, dir, depth);
    let relsCall = this.arangoServer.loadObjectGraphRels(nodeId, dir, depth);
    let rootCall = this.arangoServer.loadDocumentById(nodeId);

    Promise.all([docsCall, relsCall, rootCall]).then((response) => {
      let docsCursor = response[0];
      let relsCursor = response[1];
      let root = response[2] as any;

      this.data = [];
      this.data.push({ data: { id: root._id.replace("/", "_"), group: root._id.split("/")[0], document: root } })
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
                selector: 'edge',
                style: {
                  'width': 1,
                  'line-color': '#ccc',
                  'mid-target-arrow-color': '#ccc',
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
        });
      });
    });
  }

  private addColors() {
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
}
