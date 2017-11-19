/**
 * Created by Andrey on 10/5/2017.
 */
export interface IArangoDoc {
  collection : string;
  _id : string;
  _key : string;
}

export interface IArangoRelation {
  collection : string;
  _id : string;
  _key : string;
  _from : string;
  _to : string;
}

export class ObjectSubGraph {
  public doc_objects : any[] = [];
  public rel_objects : any[] = [];

  public docs : IArangoDoc[] = [];
  public relations : IArangoRelation[] = [];

  constructor(d : any[], r : any[]) {
    this.doc_objects = d;
    this.rel_objects = r;

    this.docs = this.doc_objects.map((obj) => {
      let collection : string = obj._id.split("/")[0];
      return {_id : obj._id, _key : obj._key, collection};
    });

    this.relations = this.rel_objects.map((obj) => {
      let collection : string = obj._id.split("/")[0];
      return {_id : obj._id, _key : obj._key, _from : obj._from, _to : obj._to, collection};
    });
  }

  public getDocById(id : string) : any {
    return this.doc_objects.filter((obj) => obj._id === id)[0];
  }

  public getRelById(id : string) : any {
    return this.rel_objects.filter((obj) => obj._id === id)[0];
  }
}
