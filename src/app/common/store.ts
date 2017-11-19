import { ArangoDb } from "./types/arango_database.type";
import { ArangoGraph } from "./types/arango_graph.type";
import {Event} from "typescript.events";

export enum AppState {
  AqlEditor = 0,
  GraphEditor = 1,
  GraphExplorer = 2,
}

export enum ArangoType {
  Document = 2,
  Relation = 3,
}

export class StoreUtils {
  public static host : string = "http://localhost:8529";
  public static username : string = "root";
  public static password : string = "gskv9988";

  public static currentDatabase : ArangoDb = null;
  public static currentGraph : ArangoGraph = null;

  public static database_names : string[] = [];
  public static databases : ArangoDb[] = [];

  public static app_state : AppState = AppState.AqlEditor;
  public static globalEventEmitter : Event = new Event();
  public static query_run_clicked : string = "query_run_clicked";
  public static comment_code_clicked : string = "comment_code_clicked";
}
