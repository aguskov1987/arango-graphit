import { Injectable } from "@angular/core";
import * as arango from "arangojs";
import { StoreUtils } from "../common/store";
import { Observable } from "rxjs/Observable";
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

interface ITrack {
  dbId: string;
  lastTick: string;
}

export interface IDbChange {
  tick: string;
  type: number;
  database: string;
  cname: string;
  data: any;
}

@Injectable()
export class ArangoService {
  private tabTicks: { [tab: number]: ITrack } = {};
  private http: Http;
  private headers: Headers;
  public connector: any;

  constructor(h: Http) {
    this.connector = new arango.Database({ url: StoreUtils.host });
    this.connector.useBasicAuth(StoreUtils.username, StoreUtils.password);
    this.http = h;
    this.headers = new Headers();
    this.headers.append("Authorization", "Basic " + btoa(StoreUtils.username + ":" + StoreUtils.password));
  }

  public loadDatabaseNames(): Promise<string[]> {
    return this.connector.listDatabases();
  }

  public async getDatabaseInfo(dbName): Promise<any> {
    return await this.connector.useDatabase(dbName).get();
  }

  public loadDbCollections(dbName): Promise<any[]> {
    return this.connector.useDatabase(dbName).listCollections();
  }

  public loadDbGraphs(dbName) {
    return this.connector.useDatabase(dbName).listGraphs();
  }

  public loadCollectionDocs(name: string): Promise<arango.Cursor> {
    this.connector.useDatabase(StoreUtils.currentDatabase.name);
    let collection = this.connector.collection(name);
    return collection.all();
  }

  public executeAqlQuery(query: string): Promise<arango.Cursor> {
    this.connector.useDatabase(StoreUtils.currentDatabase.name);
    return this.connector.query(query);
  }

  public async loadDocumentById(id: string) {
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

  public loadObjectGraphNodes(nodeId: string, dir: string, depth: number, excludes: string[] = []): Promise<arango.Cursor> {
    this.connector.useDatabase(StoreUtils.currentDatabase.name);
    let graph = StoreUtils.currentGraph.name;

    let filter = this.buildFilter(excludes, "v");
    let query = `FOR v IN 1..${depth} ${dir} '${nodeId}' 
      GRAPH '${graph}' 
      OPTIONS {uniqueVertices: "global", bfs: true} 
      ${filter} 
      RETURN v`;
    return this.connector.query(query);
  }

  public loadObjectGraphRels(nodeId: string, dir: string, depth: number, excludes: string[] = []): Promise<arango.Cursor> {
    this.connector.useDatabase(StoreUtils.currentDatabase.name);
    let graph = StoreUtils.currentGraph.name;

    let filter = this.buildFilter(excludes, "e");
    let query = `RETURN UNIQUE(FOR v, e IN 1..${depth} ${dir} '${nodeId}' GRAPH '${graph}' ${filter} RETURN e)`;
    return this.connector.query(query);
  }

  public startTrackingGraph(tabId: number) {
    let address: string = StoreUtils.host + "/_db/" + StoreUtils.currentDatabase.name + "/_api/replication/logger-state"
    this.http.get(address, {headers: this.headers})
      .map((response: Response) => response.json())
      .subscribe((data: any) => {
      this.tabTicks[tabId] = { dbId: StoreUtils.currentDatabase.id, lastTick: data.state.lastLogTick };
    })
  }

  public tabClosed(tabId: number) {
    let newTabs: { [tab: number]: ITrack } = {};
    for (let tab in this.tabTicks) {
      let id = parseInt(tab);
      if (id < tabId) {
        newTabs[id] = this.tabTicks[id];
      }
      else if (id > tabId) {
        newTabs[id - 1] = this.tabTicks[id];
      }
    }
    this.tabTicks = newTabs;
  }

  public stopTrackingGraph(tabId: number): Observable<IDbChange[]> {
    // type 2300 -> document/relation modification, new document/relation
    // type 2302 -> remove document/relation

    let track = this.tabTicks[tabId];
    if (track == null) {
      throw `no graph tracking for tab ${tabId} is available`
    }

    let address = StoreUtils.host + "/_db/" + StoreUtils.currentDatabase.name
      + "/_api/replication/logger-follow?from=" + track.lastTick;
    return this.http.get(address, {headers: this.headers}).map((response: Response) => {
      let changes = response.text().split('\n');

      if (!changes) {
        return Observable.of([]);
      }

      let body: string = '{"rows": [';
      for (let change of changes) {
        body = body + change + ",";
      }
      body = body + ']}';
      if (body.length && body.length > 1) {
        body = body.replace(",,]}", "]}");
      }
      
      let json = JSON.parse(body);
      return json.rows;
    })
  }

  private buildFilter(ids: string[], forWhat: string): string {
    let filter = "";
    if (ids.length > 0 ) {
      filter = `FILTER ${forWhat}._id NOT IN [`;
      for (let i = 0; i < ids.length; i++) {
        if (i < ids.length - 1) {
          filter += ("'" + ids[i] + "'" + ", ");
        }
        else {
          filter += ("'" + ids[i] + "'" + "]");
        }
      }
    }

    return filter;
  }
}
