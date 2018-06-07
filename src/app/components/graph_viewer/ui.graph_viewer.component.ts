import { Component, EventEmitter, OnInit, Output, Input } from "@angular/core";
import { ArangoService, IDbChange } from "../../providers/arango.service";
import * as chroma from "chroma-js";
import { StoreUtils } from "app/common/store";
import { DiffPatcher } from "jsondiffpatch";
import { EventHub, EventType } from "../../common/eventHub";

@Component({
  moduleId: module.id,
  selector: "graph-viewer",
  templateUrl: "ui.graph_viewer.component.html",
  styleUrls: ["ui.graph_viewer.component.scss"],
})
export class GraphViewerComponent implements OnInit {
  @Input() public id: number = 0;

  private arangoServer: ArangoService;
  private data: any;
  private cytoscapeContext: any;
  private tracking: boolean = false;
  private dbChanges: IDbChange[] = [];
  private rootId: string;
  private dir: string;
  private depth: number;
  private patcher: DiffPatcher;

  public previewPosition: [string, string] = ["-600px", "-600px"];
  public previewObject: any = {};

  constructor(aService: ArangoService) {
    this.arangoServer = aService;
    this.patcher = new DiffPatcher();

    EventHub.subscribe(this, 'handleStartTracking', EventType.StartTrackingGraph);
    EventHub.subscribe(this, 'handleEndTracking', EventType.StartTrackingGraph);
  }

  public ngOnInit() {
  }

  public showGraph(nodeId: string, dir: string, depth: number, label: string) {
    this.rootId = nodeId;
    this.depth = depth;
    this.dir = dir;

    let docsCall = this.arangoServer.loadObjectGraphNodes(nodeId, dir, depth);
    let relsCall = this.arangoServer.loadObjectGraphRels(nodeId, dir, depth);
    let rootCall = this.arangoServer.loadDocumentById(nodeId);

    Promise.all([docsCall, relsCall, rootCall]).then((response) => {
      let docsCursor = response[0];
      let relsCursor = response[1];
      let root = response[2] as any;

      this.data = [];

      // Load the data array with results from the query. Replace the '/' with '_' as cytoscape does not like
      // slashes in the id field
      this.data.push({ data: { id: root._id.replace("/", "_"), group: root._id.split("/")[0], document: root } });
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
            this.previewObject = event.target.data();
            console.log("preview object", this.previewObject);

            let top = event.originalEvent.clientY + "px";
            let left = event.originalEvent.clientX + "px";
            this.previewPosition = [top, left];
          });

          this.cytoscapeContext.on("unselect", (event) => {
            this.previewPosition = ["-600px", "-600px"];
          });
        });
      });
    });
  }

  public showHideChanges() {
    if (this.previewObject != null && this.previewObject.changesVisible != null) {
      this.previewObject.changesVisible = !this.previewObject.changesVisible;

      if (this.previewObject.changesVisible) {
        window.setTimeout(() => {
          let html = (global as any).formatter.format(this.previewObject.delta, this.previewObject.original);
          document.getElementById("changes" + this.id).innerHTML = html;
        }, 500);
      }
    }
  }

  private addColors(): void {
    // isolate collection names into a Set
    let groups: string[] = this.data.filter((el) => el.data.group != null).map((el) => el.data.group);
    let uniqueGroups: Set<string> = new Set();
    groups.forEach((g) => uniqueGroups.add(g));

    // Create a color scale of the same count as the unique collections
    let colors = chroma.scale(["#6FB3F1", "#FE955C", "#FAFA6E"]).mode("lch").colors(uniqueGroups.size);
    let colorMaps: [string, string][] = [];
    let counter: number = 0;

    // Assign each unique collection a color
    uniqueGroups.forEach((g) => {
      colorMaps.push([g, colors[counter]]);
      counter++;
    });

    // Store the color in the data object of the items in the cytoscape data array so it can later be used for rendering
    this.data.forEach(element => {
      if (element.data.group == null) {
        return;
      }
      let color = colorMaps.find((map) => map[0] === element.data.group)[1];
      element.data.color = color;
    });
  }

  private updateGraph(tabId: number) {
    this.arangoServer.stopTrackingGraph(tabId).subscribe((changes) => {
      if (changes == null || !changes.length || changes.length < 1) {
        return;
      }
      this.dbChanges = changes;
      this.updateDocs();
      this.updateRemovedEdges();
      this.updateAddedEdges();
    });
  }

  private updateRemovedEdges(): void {
    let removedRelations = this.dbChanges
      .filter((change) => change.type === 2302 && change.data._from != null);

    let edges = this.cytoscapeContext.$("edge");
    if (edges.length && edges.length > 0) {
      edges.forEach((edge) => {
        if (removedRelations.find((rel) => rel.data._from === edge.data()._from && rel.data._to === edge.data()._to) != null) {
          edge.style("line-style", "dotted");
        }
      });
    }
  }

  private updateAddedEdges(): void {
    // Query the graph with the same paramenters but exclude the vertices and edge already present
    // Add the new objects to the graph and mark them as 'new'
    let nodeIds: string[] = this.data
      .filter((element) => element.data.document != null)
      .map((element) => element.data.document._id);
    
    let relIds: string[] = this.data
      .filter((element) => element.data.relation != null)
      .map((element) => element.data.relation._id);

    let docsCall = this.arangoServer.loadObjectGraphNodes(this.rootId, this.dir, this.depth, nodeIds);
    let relsCall = this.arangoServer.loadObjectGraphRels(this.rootId, this.dir, this.depth, relIds);
    Promise.all([docsCall, relsCall]).then((response) => {
      let docsCursor = response[0];
      let relsCursor = response[1];

      docsCursor.all().then((docs) => {
        docs.forEach((doc) => {
          if (doc != null) {
            let node = {
              data: {
                id: doc._id.replace("/", "_"),
                group: doc._id.split("/")[0],
                document: doc,
                color: "green"
              }
            };
            this.cytoscapeContext.add(node);
          }
        });

        relsCursor.all().then((rels) => {
          rels.forEach((rel) => {
            if (rel != null) {
              let link = {
                data: {
                  source: rel._from.replace("/", "_"),
                  target: rel._to.replace("/", "_"),
                  id: rel._id.replace("/", "_"),
                  relation: rel,
                  color: "green"
                }
              };
              this.cytoscapeContext.add(link);
            }
          });
        });
      })

      // Re-run the layout to position the nodes
      let layout = this.cytoscapeContext.layout({
        name: 'cose',
        padding: 50,
        componentSpacing: 100
      });
      layout.run();
    })
  }

  private updateDocs(): void {
    for (let d of this.data) {
      let id = d.data.id.replace("_", "/");
      for (let change of this.dbChanges) {
        if (change.type === 2300 && change.data._id === id) {
          let element = this.cytoscapeContext.getElementById(d.data.id);
          element.style("border-color", "orange", );
          let delta;

          // Each node has a data property which holds the objects. Here we get the delta between the original value
          // and the new changed value and store the delta in the 'changes' property of the object
          if (element.data().document != null) {
            delta = this.patcher.diff(element.data().document, change.data);
            element.data().original = JSON.parse(JSON.stringify(element.data().document), this.patcher.dateReviver);
            element.data().document = change.data;
          }
          else {
            delta = this.patcher.diff(element.data().relation, change.data);
            element.data().original = JSON.parse(JSON.stringify(element.data().relation), this.patcher.dateReviver);
            element.data().relation = change.data;
          }
          element.data().delta = delta;
          element.data().changesVisible = false;
        }
      }
    }
  }

  private handleStartTracking(event: any) {
    let args = event as any;
    if (this.id === args.id) {
      this.arangoServer.startTrackingGraph(args.id);
    }
  }

  private handleEndTracking(event: any) {
    let args = event as any;
    if (this.id === args.id) {
      this.updateGraph(args.id);
    }
  }
}
