import { Injectable } from "@angular/core";
import * as arango from "arangojs";
import { StoreUtils } from "../common/store";

@Injectable()
export class ArangoService { 
  public connector : any;

  constructor() {
    this.connector = new arango.Database({url: StoreUtils.host});
    this.connector.useBasicAuth(StoreUtils.username, StoreUtils.password);
  }

  public loadDatabaseNames() : Promise<string[]> {
    return this.connector.listDatabases();
  }

  public loadDbCollections(dbName) : Promise<any[]> {
    return this.connector.useDatabase(dbName).listCollections();
  }

  public loadDbGraphs(dbName) {
    return this.connector.useDatabase(dbName).listGraphs();
  }

  public loadCollectionDocs(name : string) : Promise<arango.Cursor> {
    this.connector.useDatabase(StoreUtils.currentDatabase.name);
    let collection = this.connector.collection(name);
    return collection.all();
  }

  public executeAqlQuery(query : string) : Promise<arango.Cursor> {
    this.connector.useDatabase(StoreUtils.currentDatabase.name);
    return this.connector.query(query);
  }

  public async loadDocumentById(id : string) {
    let colName = id.split("/")[0];
    let key = id.split("/")[1];

    let collection = this.connector.collection(colName);
    try {
      return await collection.document(key);
    }
    catch (error) {
      return null;
    }
  }

  public loadObjectGraphNodes(nodeId : string, dir : string, depth : number) : Promise<arango.Cursor> {
    this.connector.useDatabase(StoreUtils.currentDatabase.name);
    let graph = StoreUtils.currentGraph.name;

    let query = `FOR v IN 1..${depth} ${dir} '${nodeId}' GRAPH '${graph}' RETURN v`;
    return this.connector.query(query);
  }

  public loadObjectGraphRels(nodeId : string, dir : string, depth : number) : Promise<arango.Cursor> {
    this.connector.useDatabase(StoreUtils.currentDatabase.name);
    let graph = StoreUtils.currentGraph.name;

    let query = `FOR v, e IN 1..${depth} ${dir} '${nodeId}' GRAPH '${graph}' RETURN e`;
    return this.connector.query(query);
  }
}
