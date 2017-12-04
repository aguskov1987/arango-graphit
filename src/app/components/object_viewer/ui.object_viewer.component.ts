import { Component, OnInit, Input, OnChanges, SimpleChanges } from "@angular/core";

interface Item {
  key: string;
  value: any;
  title: string;
  type: string;
  isOpened: boolean;
}

@Component({
  moduleId: module.id,
  selector: "object-viewer",
  templateUrl: "ui.object_viewer.component.html",
  styleUrls: ["ui.object_viewer.component.scss"],
})
export class ObjectViewerComponent implements OnInit, OnChanges {
  @Input() public json: any[] | Object | any;

  @Input()
  get expanded(): boolean {
    return this._expanded;
  }
  set expanded(value: boolean) {
    this._expanded = value;
  }

  public asset: Item[] = [];
  private _expanded: boolean = false;

  constructor() {
  }

  public ngOnInit() {
    if (typeof this.json !== "object") {
      return;
    }

    this.asset = [];
    Object.keys(this.json).forEach((key) => {
      this.asset.push(this.createItem(key, this.json[key]));
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  public clickHandle(item: Item) {
    if (!this.isObject(item)) {
      return;
    }
    item.isOpened = !item.isOpened;
  }

  private createItem(key: any, value: any): Item {
    let item: Item = {
      key: key || '""',
      value,
      title: value,
      type: undefined,
      isOpened: false
    };

    if (typeof (item.value) === "string") {
      item.type = "string";
      item.title = `"${item.value}"`;
    }

    else if (typeof (item.value) === "number") {
      item.type = "number";
    }

    else if (typeof (item.value) === "boolean") {
      item.type = "boolean";
    }

    else if (typeof (item.value) === "object" && Array.isArray(item.value)) {
      item.type = "array";
      item.title = `Array[${item.value.length}] ${JSON.stringify(item.value)}`;
      item.isOpened = this.expanded;
    }

    else if (typeof (item.value) === "object" && item.value !== null) {
      item.type = "object";
      item.title = `Object ${JSON.stringify(item.value)}`;
      item.isOpened = this.expanded;
    }

    else if (item.value === null) {
      item.type = "null";
      item.title = "null";
    }

    else if (item.value === undefined) {
      item.type = "undefined";
      item.title = "undefined";
    }

    item.title = "" + item.title; // defined type or 'undefined'
    return item;
  }

  private isObject(item: Item): boolean {
    let t = item.type;
    let i = ["object", "array"].indexOf(t);
    return ["object", "array"].indexOf(item.type) !== -1;
  }
}
