import { AfterViewChecked, Component, OnInit } from "@angular/core";
import { ArangoService } from "./providers/arango.service";
import { Split } from "../assets/split/split";
import { AppState, ArangoType, StoreUtils } from "./common/store";
import { ArangoDb } from "./common/types/arango_database.type";
import { ArangoGraph } from "./common/types/arango_graph.type";
import { ITreeViewItem, TreeViewItemType } from "./components/tree_view/ui.tree_view_item.interface";
import { TreeViewNodeComponent } from "./components/tree_view/ui.tree_view_node.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, AfterViewChecked {
  public appState : AppState = AppState.GraphEditor;
  public tree : ITreeViewItem;
  private service : ArangoService;

  constructor(as : ArangoService) {
    this.service = as;

    this.tree = {
      objName : "server",
      objType: TreeViewItemType.Server,
      terminalNode: false,
      collapsed: false,
      subNodes: [],
      displayName: StoreUtils.host,
      icon: "fa-server",
      color: "#55460",
    };
  }

  public ngOnInit() : void {
    Split(["#arangoTree", "#arangoContent"], {direction : "horizontal", sizes: [20, 80]});

    this.service.loadDatabaseNames().then((names) => {
      if (!names.length || names.length < 1) {
        return;
        // no databases
      }

      StoreUtils.database_names = names;
      let dbCounter : number = 0;

      for (let name of names) {
        // Add database to the SERVER tree
        let db = {
          objName : name,
          objType: TreeViewItemType.Database,
          terminalNode: false,
          collapsed: false,
          subNodes: [],
          displayName: name,
          icon: "fa-database",
          color: "#d4d5d7",
        };
        this.tree.subNodes.push(db);

        let arangoDb = new ArangoDb();
        arangoDb.name = name;

        let collectionsCall = this.service.loadDbCollections(name);
        let graphCall = this.service.loadDbGraphs(name);
        Promise.all([collectionsCall, graphCall]).then((response) => {
          let graphs = response[1];
          let docs = response[0].filter((c) => c.type === ArangoType.Document).map((c) => c.name);
          let rels = response[0].filter((c) => c.type === ArangoType.Relation).map((c) => c.name);

          arangoDb.doc_collections = docs;
          arangoDb.rel_collections = rels;

          if (graphs.length && graphs.length > 0) {
            for (let g of graphs) {
              let graphRow = {
                Name : g._key,
                objName: g._key,
                objType: TreeViewItemType.Graph,
                terminalNode: false,
                collapsed: false,
                subNodes: [],
                displayName: g._key,
                icon: "fa-share-alt",
                color: "#359680",
              };
              db.subNodes.push(graphRow);
              let graphDocCollections = new Set();
              for (let ed of g.edgeDefinitions) {
                graphDocCollections.add(ed.from[0]);
                graphDocCollections.add(ed.to[0]);
                graphDocCollections.add(ed.from[1]);
                graphDocCollections.add(ed.to[1]);
              }
              for (let c of g.orphanCollections) {
                graphDocCollections.add(c);
              }

              graphDocCollections.forEach((doc) => {
                let docRow = {
                  objName : doc,
                  objType: TreeViewItemType.GraphVertexCollection,
                  terminalNode: true,
                  collapsed: false,
                  subNodes: [],
                  displayName: doc,
                  icon: "fa-file-o",
                  color: "#e4cb94",
                };
                graphRow.subNodes.push(docRow);
              });

              g.edgeDefinitions.forEach((ed) => {
                let relRow = { 
                  objName : ed.collection,
                  objType: TreeViewItemType.GraphRelCollection,
                  terminalNode: true,
                  collapsed: false,
                  subNodes: [],
                  displayName: ed.collection,
                  icon: "fa-link",
                  color: "#99bbe2",
                };
                graphRow.subNodes.push(relRow);
              });

              let graph = new ArangoGraph();
              graph.name = g._key;
              arangoDb.graphs.push(graph);
            }
          }
        });
        StoreUtils.databases.push(arangoDb);
        dbCounter++;

        // Once we are finished with loading all the databases, load names into the lists
        if (dbCounter === StoreUtils.databases.length) {
          StoreUtils.currentDatabase = StoreUtils.databases[0];

          if (StoreUtils.databases[0].graphs.length && StoreUtils.databases[0].graphs.length > 0) {
            StoreUtils.currentGraph = StoreUtils.databases[0].graphs[0];
          }
        }
      }
    });
  }

  public ngAfterViewChecked() : void {
    this.appState = StoreUtils.app_state;
  }

  public onNodeRightClick(node : TreeViewNodeComponent) {
    if (node != null && node.item != null) {
      if (node.item.objType === TreeViewItemType.Graph && node.parent != null) {
        StoreUtils.currentDatabase = StoreUtils.databases.find((d) => d.name === node.parent.item.objName);
        StoreUtils.currentGraph = StoreUtils.currentDatabase.graphs.find((g) => g.name === node.item.objName);
      }
    }
  }
}
