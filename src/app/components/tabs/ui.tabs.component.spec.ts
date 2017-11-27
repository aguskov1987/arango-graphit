// region Imports
import {ArangoService} from '../../providers/arango.service';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, NgZone, Renderer2 } from '@angular/core';
import { TabsComponent } from 'app/components/tabs/ui.tabs.component';
import { TabComponent, TabType } from 'app/components/tabs/ui.tab.component';
import { TabContentComponent } from 'app/components/tabs/ui.tabContent.component';
import { AqlEditorComponent } from 'app/components/aql_editor/ui.aql_editor.component';
import { GraphObjExplorerComponent } from 'app/components/graph_object_explorer/graph_obj_explorer.component';
import { GraphViewerComponent } from 'app/components/graph_viewer/ui.graph_viewer.component';
import { AceEditorComponent } from 'ng2-ace-editor/src/component';
import { ElectronService } from 'app/providers/electron.service';
// endregion

describe('Tabs Component', () => {
    let fixture;
    let component;
    let numOfEvents = 0;

    beforeEach(async(() => {
        let electronServiceStub = {
            ipcRenderer: {on: (event, method) => {numOfEvents++}}
        }

        TestBed.configureTestingModule({
            declarations: [TabsComponent, TabComponent, TabContentComponent, AqlEditorComponent,
                GraphObjExplorerComponent, GraphViewerComponent, AceEditorComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [{provide: ElectronService, useValue: electronServiceStub}]
        }).compileComponents;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TabsComponent);
        component = fixture.debugElement.componentInstance;
    });

    afterEach(() => {
        numOfEvents = 0;
    });

    it("should check that the component is created and ipcRenderer events are registered", () => {
        expect(component).toBeTruthy();
        expect(numOfEvents).toEqual(3);
    });

    it('should create the first tab and mark it active', () => {
        component.addNewTab(TabType.DbAQL, "db", "grf");

        expect(component.items).not.toBeNull;
        expect(component.items.length).toEqual(1);
        expect(component.items[0].active).toBeTruthy();
        expect(component.items[0].id).toEqual(0);
        expect(component.items[0].database).toEqual("db");
        expect(component.items[0].graph).toEqual("grf");
    });

    it('should add the second tab, mark it active and mark the first one inactive', () => {
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");

        expect(component.items).not.toBeNull;
        expect(component.items.length).toEqual(2);
        expect(component.items[0].active).toBeFalsy();
        expect(component.items[1].active).toBeTruthy();
        expect(component.items[0].id).toEqual(0);
        expect(component.items[1].id).toEqual(1);
    });

    it('should activate a tab when clicked', () => {
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");

        expect(component.items[0].active).toBeFalsy();
        expect(component.items[1].active).toBeTruthy();

        component.tabClicked(0);

        expect(component.items[0].active).toBeTruthy();
        expect(component.items[1].active).toBeFalsy();
    });

    it('should close the last of 4 tabs and mark the 3rd one as active', () => {
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");

        expect(component.items[3].active).toBeTruthy();

        component.tabCloseClicked(3);

        expect(component.items[2].active).toBeTruthy();
    });

    it('should close the first of 4 tabs and mark the 2nd once as active', () => {
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.tabClicked(0);

        expect(component.items[0].active).toBeTruthy();

        component.tabCloseClicked(0);

        expect(component.items[0].active).toBeTruthy();
    });

    it('should re-order tabs after one of the tabs is closed', () => {
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.addNewTab(TabType.DbAQL, "db", "grf");
        component.tabCloseClicked(1);

        expect(component.items.length).toEqual(3);
        expect(component.items[0].id).toEqual(0);
        expect(component.items[1].id).toEqual(1);
        expect(component.items[2].id).toEqual(2);
    });
});