import * as fs from 'fs';
import { Component, OnInit, AfterViewInit, Renderer2, ViewChild, isDevMode, HostListener, Input } from '@angular/core';
import { AceEditorComponent } from "ng2-ace-editor";
import { CodeHinterComponent } from "../code_hinter/ui.code_hinter.component";
import { ArangoService } from "../../providers/arango.service";
import { EventHub, EventType } from '../../common/eventHub';
import { ElectronService } from '../../providers/electron.service';
import { QueryValidationResult } from '../../common/types/QueryValidationResult';

@Component({
  moduleId: module.id,
  selector: "aql-editor",
  templateUrl: "ui.aql_editor.component.html",
})
export class AqlEditorComponent implements OnInit, AfterViewInit {
  @Input() public id: number;
  @Input() public active: boolean = false;
  @Input() public text = "";
  @ViewChild("editor") public editorComponent: AceEditorComponent;
  @ViewChild("hinter") public codeHinter: CodeHinterComponent;

  public savedPath = "";
  public queryResult: any[] = [];
  public tabId: number;
  public queryError: string = "";

  private currentToken: any = null;
  private editor: any;
  private hinterOn: boolean = false;
  private hinterJustClicked: boolean = false;
  private queryValidationTimer: any;
  private interval = 2000;
  private prevErrorLine: number = -1;

  private renderer: Renderer2;
  private arangoService: ArangoService;
  private electronService: ElectronService;
  private fileService = fs;

  constructor(r: Renderer2, as: ArangoService, es: ElectronService) {
    this.renderer = r;
    this.arangoService = as;
    this.electronService = es;

    EventHub.subscribe(this, 'handleTextInput', EventType.AqlPopulation)
    EventHub.subscribe(this, 'handleQueryRun', EventType.RunQueryClicked);
    EventHub.subscribe(this, 'handleCommentCode', EventType.CommentCodeClicked);
    EventHub.subscribe(this, 'handleSaveQuery', EventType.SaveClicked);
  }

  public ngOnInit(): void {
    this.editorComponent.setOptions({ fontSize: "12pt" });
    this.editor = this.editorComponent.getEditor();
    this.editor.getSelection().on("changeCursor", () => {
      this.codeHinter.hideHinter();
      this.clearBindings();
    });
  }

  ngAfterViewInit(): void {
    let Split = require("split.js");
    Split(["#aqlCodeEditor" + this.id, "#aqlResultPanel" + this.id], { direction: "vertical", sizes: [50, 50] });
  }

  public captureCursorPosition(): [string, string] {
    let bodyRect = document.body.getBoundingClientRect();
    let cursor = document.getElementById("aqlCodeEditor" + this.id).getElementsByClassName("ace_cursor")[0];

    let cursorRect = cursor.getBoundingClientRect();
    let topPosition = cursorRect.top - bodyRect.top;
    let leftPosition = cursorRect.left - bodyRect.left;

    return [(topPosition + 20) + "px", leftPosition + "px"];
  }

  public showHinter() {
    this.codeHinter.showHinter(this.captureCursorPosition());
    this.hinterOn = true;

    this.editor.commands.addCommand({
      name: "down_arrow",
      exec: () => { this.codeHinter.goUpDown("down"); },
      bindKey: { win: "Down" },
    });
    this.editor.commands.addCommand({
      name: "up_arrow",
      exec: () => { this.codeHinter.goUpDown("up"); },
      bindKey: { win: "Up" },
    });
    this.editor.commands.addCommand({
      name: "enter-press",
      exec: () => { this.codeHinter.onOptionClick(); },
      bindKey: { win: "Enter" },
    });
    this.editor.commands.addCommand({
      name: "esc-press",
      exec: () => {
        this.codeHinter.hideHinter();
        this.clearBindings();
      },
      bindKey: { win: "Esc" },
    });
    if (isDevMode()) {
      console.log("code hinter bindings added");
    }

    let editor = this.renderer.selectRootElement(".ace_text-input");
    editor.focus();
  }

  public onTextChanged(event: any) {
    clearTimeout(this.queryValidationTimer);
    this.queryValidationTimer = setTimeout(() => {this.ValidateQuery()}, this.interval);

    if (isDevMode) {
      console.log("onTextChanged triggered");
    }
    if (this.hinterJustClicked) {
      this.hinterJustClicked = false;
      return;
    }
    let position = this.editor.getCursorPosition();
    let token = this.editor.session.getTokenAt(position.row, position.column);
    this.currentToken = token;

    if (token !== null && token.value !== "" && token.value !== " "
      && token.value !== "{" && token.value !== "}" && token.value !== "("
      && token.value !== ")" && token.value !== "[" && token.value !== "]") {
      if (isDevMode) {
        console.log("current aql editor token - " + token.value);
      }
      this.codeHinter.updateOptionsList(token.value);
      if (this.codeHinter.optionsAvailable && !this.codeHinter.isOneOptionAndSameAsToken(token.value)) {
        this.showHinter();
      }
    }
    else {
      if (this.hinterOn) {
        this.codeHinter.hideHinter();
        this.hinterOn = false;
        this.clearBindings();
      }
    }
  }

  public hinterOptionSelected(word: string) {
    this.hinterJustClicked = true;
    if (isDevMode) {
      console.log("hinter option selected");
    }
    let row = this.editor.getSelectionRange().start.row;
    let range = this.editor.getSelectionRange().clone();
    range.start.row = row;
    range.end.row = row;
    range.start.column = this.currentToken.start;
    range.end.column = this.currentToken.start + this.currentToken.value.length;
    this.editor.session.replace(range, word);
    this.codeHinter.hideHinter();
  }

  @HostListener("keyup", ["$event"])
  public handleKeyboardEvent(kbdEvent: KeyboardEvent) {
    if (kbdEvent.code === "F5") {
      this.arangoService.executeAqlQuery(this.text).then((cursor) => {
        cursor.all().then((items) => {
          this.queryResult = items;
        });
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  public focusOnEditor() {
    this.editor.focus();
  }

  private clearBindings() {
    if (this.editor.keyBinding.$defaultHandler.commandKeyBinding.down.length === 2) {
      this.editor.keyBinding.$defaultHandler.commandKeyBinding.down.pop();
      this.editor.keyBinding.$defaultHandler.commandKeyBinding.up.pop();
      delete this.editor.keyBinding.$defaultHandler.commandKeyBinding.return;
      delete this.editor.keyBinding.$defaultHandler.commandKeyBinding.esc;

      if (isDevMode()) {
        console.log("code hinter bindings removed");
      }
    }
  }

  private handleQueryRun() {
    if (!this.active) {
      return;
    }
    this.arangoService.executeAqlQuery(this.text).then((cursor) => {
      cursor.all().then((items) => {
        this.queryResult = items;
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  private handleCommentCode() {
    this.editor.toggleCommentLines();
  }

  private handleSaveQuery() {
    if (!this.active) {
      return;
    }
    if (!this.savedPath) {
      let filepath = this.electronService.ipcRenderer.sendSync("openSaveFileDialog");
      if (filepath) {
        this.savedPath = filepath;
        this.fileService.writeFile(this.savedPath, this.text, (error) => { });
      }
    }
    else {
      this.fileService.writeFile(this.savedPath, this.text, (error) => { });
    }
  }

  private handleTextInput(data: any) {
    if (this.active) {
      this.text = data.text;
      this.savedPath = data.path;
    }
  }

  private ValidateQuery() {
    let normalColor = "#8F908A";
    let errorColor = "red";
    let gutterCells = document.getElementsByClassName("ace_gutter-cell");
    if (this.prevErrorLine !== -1) {
      let div = gutterCells[this.prevErrorLine - 1] as HTMLDivElement;
      div.style.color = normalColor;
    }

    this.arangoService.validateQuery(this.text).subscribe(
      (validation) => {
        this.queryError = "";
      },
      (error) => {
        let body = JSON.parse(error._body);
        this.queryError = body.errorMessage;
        let validation = new QueryValidationResult(body.errorMessage);

        let errorPosition = validation.getErrorPosition();
        if (errorPosition[1] != null) {
          this.prevErrorLine = errorPosition[1];
        
          let div = gutterCells[errorPosition[1] - 1] as HTMLDivElement;
          div.style.color = errorColor;
        }
      });
  }
}
