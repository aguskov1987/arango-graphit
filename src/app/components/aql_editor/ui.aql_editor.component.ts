/**
 * Created by Andrey on 10/4/2017.
 */
import { Component, OnInit, Renderer2, ViewChild, isDevMode, HostListener } from '@angular/core';
import { AceEditorComponent } from "ng2-ace-editor";
import { CodeHinterComponent } from "../code_hinter/ui.code_hinter.component";
import { Split } from "../../../assets/split/split";
import { ArangoService } from "../../providers/arango.service";
import { StoreUtils } from "../../common/store";

@Component({
    moduleId: module.id,
    selector: "aql-editor",
    templateUrl: "ui.aql_editor.component.html",
    styles: [`
      #aqlCodeEditor {
        overflow: auto;
      }
      #aqlResultPanel {
        overflow: auto;
      }
    `],
})
export class AqlEditorComponent implements OnInit {
  @ViewChild("editor") public editorComponent : AceEditorComponent;
  @ViewChild("hinter") public codeHinter : CodeHinterComponent;

  public text = "";
  public queryResult : any[] = [];
  public tabId : number;

  private currentToken : any = null;
  private editor : any;
  private hinterOn : boolean = false;
  private hinterJustClicked : boolean = false;
  private renderer : Renderer2;
  private arangoService : ArangoService;

  constructor(r : Renderer2, as : ArangoService) {
    this.renderer = r;
    this.arangoService = as;
  }

  public ngOnInit() : void {
    Split(["#aqlCodeEditor", "#aqlResultPanel"], {direction : "vertical", sizes: [50, 50]});

    this.editorComponent.setOptions({fontSize: "12pt"});
    this.editor = this.editorComponent.getEditor();
    this.editor.getSelection().on("changeCursor", () => {
      this.codeHinter.hideHinter();
      this.clearBindings();
    });

    StoreUtils.globalEventEmitter.on(StoreUtils.query_run_clicked, () => {
      this.arangoService.executeAqlQuery(this.text).then((cursor) => {
        cursor.all().then((items) => {
          this.queryResult = items;
        });
      }).catch((error) => {
        console.log(error);
      });
    });

    StoreUtils.globalEventEmitter.on(StoreUtils.comment_code_clicked, () => {
      this.editor.toggleCommentLines();
    });
  }

  public captureCursorPosition() : [string, string] {
    let bodyRect = document.body.getBoundingClientRect();
    let cursor = document.getElementsByClassName("ace_cursor")[0];
    let cursorRect = cursor.getBoundingClientRect();
    let topPosition = cursorRect.top - bodyRect.top;
    let leftPosition = cursorRect.left - bodyRect.left;

    return [(topPosition + 20) + "px", leftPosition + "px"];
  }

  public showHinter() {
    this.codeHinter.showHinter(this.captureCursorPosition());
    this.hinterOn = true;

    this.editor.commands.addCommand({
      name : "down_arrow",
      exec : () => { this.codeHinter.goUpDown("down"); },
      bindKey : {win: "Down"},
    });
    this.editor.commands.addCommand({
      name : "up_arrow",
      exec : () => { this.codeHinter.goUpDown("up"); },
      bindKey : {win: "Up"},
    });
    this.editor.commands.addCommand({
      name : "enter-press",
      exec : () => { this.codeHinter.onOptionClick(); },
      bindKey : {win : "Enter"},
    });
    this.editor.commands.addCommand({
      name : "esc-press",
      exec : () => {
        this.codeHinter.hideHinter();
        this.clearBindings();
        },
      bindKey : {win : "Esc"},
    });
    if (isDevMode()) {
      console.log("code hinter bindings added");
    }

    let editor = this.renderer.selectRootElement(".ace_text-input");
    editor.focus();
  }

  public onTextChanged() {
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

  public hinterOptionSelected(word : string) {
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
  public handleKeyboardEvent(kbdEvent : KeyboardEvent) {
    if (kbdEvent.code === "F4") {
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

}
