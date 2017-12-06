import { ArangoGraph } from "./arango_graph.type";

export class ArangoDb {
  public name: string = "";
  public id: string = "";
  public doc_collections: string[] = [];
  public rel_collections: string[] = [];
  public graphs: ArangoGraph[] = [];
}
