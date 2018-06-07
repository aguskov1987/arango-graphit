import { ArangoDb } from "./types/arango_database.type";
import { ArangoGraph } from "./types/arango_graph.type";
import { Event } from "typescript.events";
import { LabelMapping } from "app/common/types/label_mapping.type";

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
  public static host: string = "http://localhost:8529";
  public static username: string = "root";
  public static password: string = "Tnln1601";

  public static currentDatabase: ArangoDb = null;
  public static currentGraph: ArangoGraph = null;

  public static database_names: string[] = [];
  public static databases: ArangoDb[] = [];
  public static labelMappings: LabelMapping[] = [];
}
