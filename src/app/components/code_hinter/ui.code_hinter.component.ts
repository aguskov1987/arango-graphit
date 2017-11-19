/**
 * Created by Andrey on 9/28/2017.
 */
import { Component, EventEmitter, OnInit, Output } from "@angular/core";

enum OptionType {
  Keyword,
  Function,
  LocalVariable,
  DocumentCollection,
  RelationCollection,
}

class Option {
  public name : string = "";
  public type : OptionType = OptionType.Keyword;
  public selected : boolean = false;
}

@Component({
  moduleId: module.id,
  selector: "code-hinter",
  templateUrl: "ui.code_hinter.component.html",
  styleUrls: ["ui.code_hinter.component.scss"],
})
export class CodeHinterComponent implements OnInit {
  public position : [string, string] = ["-500px", "-500px"];
  @Output() public optionSelected = new EventEmitter();

  private keywordOptions : Option[] = [];
  private functionOptions : Option[] = [];
  private localVariableOptions : Option[] = [];
  private docCollectionOptions : Option[] = [];
  private relCollectionOptions : Option[] = [];
  private options : Option[] = [];

  private active : boolean = false;

  constructor() {
    this.populateOptions();
  }

  public ngOnInit() {
  }

  public updateOptionsList(input : string) {
    this.options = [];
    let keywords = this.keywordOptions.filter((k) => k.name.includes(input.toUpperCase()));
    this.options.push(...keywords);

    let funcs = this.functionOptions.filter((f) => f.name.includes(input.toUpperCase()));
    this.options.push(...funcs);

    if (this.docCollectionOptions.length && this.docCollectionOptions.length > 0) {
      let docs = this.docCollectionOptions.filter((d) => d.name.includes(input.toUpperCase()));
      this.options.push(...docs);
    }
    if (this.relCollectionOptions.length && this.relCollectionOptions.length > 0) {
      let rels = this.relCollectionOptions.filter((r) => r.name.includes(input.toUpperCase()));
      this.options.push(...rels);
    }
    if (this.localVariableOptions.length && this.localVariableOptions.length > 0) {
      let locals = this.localVariableOptions.filter((l) => l.name.includes(input.toUpperCase()));
      this.options.push(...locals);
    }

    if (this.options.length > 0) {
      this.options.forEach((o) => o.selected = false);
      this.options[0].selected = true;
    }
  }

  public showHinter(position : [string, string]) {
    if (!this.options.length || this.options.length < 1) {
      this.position = ["-500px", "-500px"];
      this.active = false;
      return;
    }
    this.active = true;
    this.position = position;
  }

  public hideHinter() {
    this.active = false;
    this.position = ["-500px", "-500px"];
  }

  public goUpDown(dir : string) {
    if (this.active) {
      if (dir === "down") {
        let i = this.options.findIndex((o) => o.selected === true);
        if (i === this.options.length - 1) {
          return;
        }
        this.options[i + 1].selected = true;
        this.options[i].selected = false;
      }
      else if (dir === "up") {
        let i = this.options.findIndex((o) => o.selected === true);
        if (i === 0) {
          return;
        }
        this.options[i - 1].selected = true;
        this.options[i].selected = false;
      }
    }
  }

  public onOptionHover(option : Option) {
    let i = this.options.indexOf(option);
    this.options.forEach((o) => o.selected = false);
    this.options[i].selected = true;
  }

  public onOptionClick() {
    if (this.active && this.options.length && this.options.length > 0) {
      this.optionSelected.emit(this.options.filter((o) => o.selected)[0].name);
    }
  }

  public populateDocOptions(docs : string[]) {
    this.docCollectionOptions = docs.map((d) => {
      return {name: d, selected: false, type: OptionType.DocumentCollection};
    });
  }

  public populateRelOptions(rels : string[]) {
    this.relCollectionOptions = rels.map((r) => {
      return {name: r, selected: false, type: OptionType.RelationCollection};
    });
  }

  public addVariableOption(variable : string) {
    this.localVariableOptions.push({name: variable, selected: false, type: OptionType.LocalVariable});
  }

  private populateOptions() {
    this.keywordOptions = [
      {name: "AGGREGATE", selected: false, type: OptionType.Keyword},
      {name: "ALL", selected: false, type: OptionType.Keyword},
      {name: "AND", selected: false, type: OptionType.Keyword},
      {name: "ANY", selected: false, type: OptionType.Keyword},
      {name: "ASC", selected: false, type: OptionType.Keyword},
      {name: "COLLECT", selected: false, type: OptionType.Keyword},
      {name: "DESC", selected: false, type: OptionType.Keyword},
      {name: "DISTINCT", selected: false, type: OptionType.Keyword},
      {name: "FALSE", selected: false, type: OptionType.Keyword},
      {name: "FILTER", selected: false, type: OptionType.Keyword},
      {name: "FOR", selected: false, type: OptionType.Keyword},

      {name: "GRAPH", selected: false, type: OptionType.Keyword},
      {name: "IN", selected: false, type: OptionType.Keyword},
      {name: "INBOUND", selected: false, type: OptionType.Keyword},
      {name: "INSERT", selected: false, type: OptionType.Keyword},
      {name: "INTO", selected: false, type: OptionType.Keyword},
      {name: "LEFT", selected: false, type: OptionType.Keyword},
      {name: "LIMIT", selected: false, type: OptionType.Keyword},
      {name: "NOT", selected: false, type: OptionType.Keyword},
      {name: "NONE", selected: false, type: OptionType.Keyword},
      {name: "NULL", selected: false, type: OptionType.Keyword},
      {name: "OR", selected: false, type: OptionType.Keyword},

      {name: "OUTBOUND", selected: false, type: OptionType.Keyword},
      {name: "REMOVE", selected: false, type: OptionType.Keyword},
      {name: "REPLACE", selected: false, type: OptionType.Keyword},
      {name: "RETURN", selected: false, type: OptionType.Keyword},
      {name: "SHORTEST_PATH", selected: false, type: OptionType.Keyword},
      {name: "SORT", selected: false, type: OptionType.Keyword},
      {name: "TRUE", selected: false, type: OptionType.Keyword},
      {name: "UPDATE", selected: false, type: OptionType.Keyword},
      {name: "UPSERT", selected: false, type: OptionType.Keyword},
      {name: "WITH", selected: false, type: OptionType.Keyword},
    ];
    this.functionOptions = [
      // conversions
      {name: "TO_BOOL", selected: false, type: OptionType.Function},
      {name: "TO_NUMBER", selected: false, type: OptionType.Function},
      {name: "TO_STRING", selected: false, type: OptionType.Function},
      {name: "TO_ARRAY", selected: false, type: OptionType.Function},
      {name: "TO_LIST", selected: false, type: OptionType.Function},

      // checks
      {name: "IS_BOOL", selected: false, type: OptionType.Function},
      {name: "IS_NUMBER", selected: false, type: OptionType.Function},
      {name: "IS_STRING", selected: false, type: OptionType.Function},
      {name: "IS_ARRAY", selected: false, type: OptionType.Function},
      {name: "IS_LIST", selected: false, type: OptionType.Function},
      {name: "IS_OBJECT", selected: false, type: OptionType.Function},
      {name: "IS_DOCUMENT", selected: false, type: OptionType.Function},
      {name: "IS_DATESTRING", selected: false, type: OptionType.Function},

      // strings
      {name: "CHAR_LENGTH", selected: false, type: OptionType.Function},
      {name: "CONCAT", selected: false, type: OptionType.Function},
      {name: "CONCAT_SEPARATOR", selected: false, type: OptionType.Function},
      {name: "CONTAINS", selected: false, type: OptionType.Function},
      {name: "FIND_FIRST", selected: false, type: OptionType.Function},
      {name: "FIND_LAST", selected: false, type: OptionType.Function},
      {name: "JSON_PARSE", selected: false, type: OptionType.Function},
      {name: "JSON_STRINGIFY", selected: false, type: OptionType.Function},
      {name: "LEFT", selected: false, type: OptionType.Function},
      {name: "LIKE", selected: false, type: OptionType.Function},
      {name: "LOWER", selected: false, type: OptionType.Function},
      {name: "LTRIM", selected: false, type: OptionType.Function},
      {name: "MD5", selected: false, type: OptionType.Function},
      {name: "RANDOM_TOKEN", selected: false, type: OptionType.Function},
      {name: "REGEX_TEST", selected: false, type: OptionType.Function},
      {name: "REGEX_REPLACE", selected: false, type: OptionType.Function},
      {name: "REVERSE", selected: false, type: OptionType.Function},
      {name: "RIGHT", selected: false, type: OptionType.Function},
      {name: "RTRIM", selected: false, type: OptionType.Function},
      {name: "SHA1", selected: false, type: OptionType.Function},
      {name: "SPLIT", selected: false, type: OptionType.Function},
      {name: "SUBSTITUTE", selected: false, type: OptionType.Function},
      {name: "SUBSTRING", selected: false, type: OptionType.Function},
      {name: "TRIM", selected: false, type: OptionType.Function},
      {name: "UPPER", selected: false, type: OptionType.Function},

      // numerical
      {name: "ABS", selected: false, type: OptionType.Function},
      {name: "ACOS", selected: false, type: OptionType.Function},
      {name: "ASIN", selected: false, type: OptionType.Function},
      {name: "ATAN", selected: false, type: OptionType.Function},
      {name: "ATAN2", selected: false, type: OptionType.Function},
      {name: "AVERAGE", selected: false, type: OptionType.Function},
      {name: "CEIL", selected: false, type: OptionType.Function},
      {name: "COS", selected: false, type: OptionType.Function},
      {name: "DEGREES", selected: false, type: OptionType.Function},
      {name: "EXP", selected: false, type: OptionType.Function},
      {name: "EXP2", selected: false, type: OptionType.Function},
      {name: "FLOOR", selected: false, type: OptionType.Function},
      {name: "LOG", selected: false, type: OptionType.Function},
      {name: "LOG2", selected: false, type: OptionType.Function},
      {name: "LOG10", selected: false, type: OptionType.Function},
      {name: "MAX", selected: false, type: OptionType.Function},
      {name: "MEDIAN", selected: false, type: OptionType.Function},
      {name: "MIN", selected: false, type: OptionType.Function},
      {name: "PERCENTILE", selected: false, type: OptionType.Function},
      {name: "PI", selected: false, type: OptionType.Function},
      {name: "POW", selected: false, type: OptionType.Function},
      {name: "RADIANS", selected: false, type: OptionType.Function},
      {name: "RAND", selected: false, type: OptionType.Function},
      {name: "RANGE", selected: false, type: OptionType.Function},
      {name: "ROUND", selected: false, type: OptionType.Function},
      {name: "SIN", selected: false, type: OptionType.Function},
      {name: "SQRT", selected: false, type: OptionType.Function},
      {name: "STDDEV_POPULATION", selected: false, type: OptionType.Function},
      {name: "STDDEV_SAMPLE", selected: false, type: OptionType.Function},
      {name: "SUM", selected: false, type: OptionType.Function},
      {name: "VARIANCE_POPULATION", selected: false, type: OptionType.Function},
      {name: "TAN", selected: false, type: OptionType.Function},
      {name: "VARIANCE_SAMPLE", selected: false, type: OptionType.Function},

      // date
      {name: "DATE_NOW", selected: false, type: OptionType.Function},
      {name: "DATE_ISO8601", selected: false, type: OptionType.Function},
      {name: "DATE_TIMESTAMP", selected: false, type: OptionType.Function},
      {name: "IS_DATESTRING", selected: false, type: OptionType.Function},
      {name: "DATE_DAYOFWEEK", selected: false, type: OptionType.Function},
      {name: "DATE_YEAR", selected: false, type: OptionType.Function},
      {name: "DATE_MONTH", selected: false, type: OptionType.Function},
      {name: "DATE_DAY", selected: false, type: OptionType.Function},
      {name: "DATE_HOUR", selected: false, type: OptionType.Function},
      {name: "DATE_MINUTE", selected: false, type: OptionType.Function},
      {name: "DATE_SECOND", selected: false, type: OptionType.Function},
      {name: "DATE_MILLISECOND", selected: false, type: OptionType.Function},
      {name: "DATE_DAYOFYEAR", selected: false, type: OptionType.Function},
      {name: "DATE_ISOWEEK", selected: false, type: OptionType.Function},
      {name: "DATE_LEAPYEAR", selected: false, type: OptionType.Function},
      {name: "DATE_QUARTER", selected: false, type: OptionType.Function},
      {name: "DATE_DAYS_IN_MONTH", selected: false, type: OptionType.Function},
      {name: "DATE_FORMAT", selected: false, type: OptionType.Function},
      {name: "DATE_ADD", selected: false, type: OptionType.Function},
      {name: "DATE_SUBTRACT", selected: false, type: OptionType.Function},
      {name: "DATE_DIFF", selected: false, type: OptionType.Function},
      {name: "DATE_COMPARE", selected: false, type: OptionType.Function},

      // arrays
      {name: "APPEND", selected: false, type: OptionType.Function},
      {name: "COUNT", selected: false, type: OptionType.Function},
      {name: "FIRST", selected: false, type: OptionType.Function},
      {name: "FLATTEN", selected: false, type: OptionType.Function},
      {name: "INTERSECTION", selected: false, type: OptionType.Function},
      {name: "LAST", selected: false, type: OptionType.Function},
      {name: "LENGTH", selected: false, type: OptionType.Function},
      {name: "MINUS", selected: false, type: OptionType.Function},
      {name: "NTH", selected: false, type: OptionType.Function},
      {name: "OUTERSECTION", selected: false, type: OptionType.Function},
      {name: "POP", selected: false, type: OptionType.Function},
      {name: "POSITION", selected: false, type: OptionType.Function},
      {name: "PUSH", selected: false, type: OptionType.Function},
      {name: "REMOVE_NTH", selected: false, type: OptionType.Function},
      {name: "REMOVE_VALUE", selected: false, type: OptionType.Function},
      {name: "REMOVE_VALUES", selected: false, type: OptionType.Function},
      {name: "REVERSE", selected: false, type: OptionType.Function},
      {name: "SHIFT", selected: false, type: OptionType.Function},
      {name: "SLICE", selected: false, type: OptionType.Function},
      {name: "UNION", selected: false, type: OptionType.Function},
      {name: "UNION_DISTINCT", selected: false, type: OptionType.Function},
      {name: "UNIQUE", selected: false, type: OptionType.Function},
      {name: "UNSHIFT", selected: false, type: OptionType.Function},

      // documents
      {name: "ATTRIBUTES", selected: false, type: OptionType.Function},
      {name: "COUNT", selected: false, type: OptionType.Function},
      {name: "HAS", selected: false, type: OptionType.Function},
      {name: "IS_SAME_COLLECTION", selected: false, type: OptionType.Function},
      {name: "KEEP", selected: false, type: OptionType.Function},
      {name: "LENGTH", selected: false, type: OptionType.Function},
      {name: "MATCHES", selected: false, type: OptionType.Function},
      {name: "MERGE", selected: false, type: OptionType.Function},
      {name: "MERGE_RECURSIVE", selected: false, type: OptionType.Function},
      {name: "PARSE_IDENTIFIER", selected: false, type: OptionType.Function},
      {name: "TRANSLATE", selected: false, type: OptionType.Function},
      {name: "UNSET", selected: false, type: OptionType.Function},
      {name: "UNSET_RECURSIVE", selected: false, type: OptionType.Function},
      {name: "VALUES", selected: false, type: OptionType.Function},
      {name: "ZIP", selected: false, type: OptionType.Function},
    ];
  }
}
