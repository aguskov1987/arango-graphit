import 'zone.js';
import 'reflect-metadata';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ToolbarComponent } from 'app/components/toolbar/ui.toolbar.component';
import {TabsComponent} from './components/tabs/ui.tabs.component';
import {TabContentComponent} from './components/tabs/ui.tabContent.component';
import {TabComponent} from './components/tabs/ui.tab.component';
import {TreeViewNodeComponent} from './components/tree_view/ui.tree_view_node.component';
import {ObjectViewerComponent} from './components/object_viewer/ui.object_viewer.component';
import {TableViewerComponent} from './components/table_viewer/ui.table_viewer.component';
import {TreeViewComponent} from './components/tree_view/ui.tree_view.component';
import {AqlEditorComponent} from './components/aql_editor/ui.aql_editor.component';
import {CodeHinterComponent} from './components/code_hinter/ui.code_hinter.component';
import {GraphViewerComponent} from './components/graph_viewer/ui.graph_viewer.component';
import {SharedModule, RadioButtonModule, SpinnerModule, InputTextModule, DataTableModule} from 'primeng/primeng';
import {AceEditorModule} from 'ng2-ace-editor';
import {ArangoService} from './providers/arango.service';
import { AppComponent } from './app.component';
import { ElectronService } from './providers/electron.service';
import { GraphObjExplorerComponent } from 'app/components/graph_object_explorer/graph_obj_explorer.component';
import { LabelMappingsComponent } from 'app/components/app_settings/ui.label_mappings.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    AqlEditorComponent,
    GraphViewerComponent,
    ObjectViewerComponent,
    TableViewerComponent,
    TreeViewNodeComponent,
    TreeViewComponent,
    TabComponent,
    TabContentComponent,
    TabsComponent,
    GraphObjExplorerComponent,
    CodeHinterComponent,
    LabelMappingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AceEditorModule,
    DataTableModule,
    InputTextModule,
    SpinnerModule,
    RadioButtonModule,
    SharedModule,
  ],
  providers: [ElectronService, ArangoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
