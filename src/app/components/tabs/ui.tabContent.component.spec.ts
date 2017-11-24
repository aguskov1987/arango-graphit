import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { TabContentComponent } from 'app/components/tabs/ui.tabContent.component';
import { AqlEditorComponent } from 'app/components/aql_editor/ui.aql_editor.component';
import { GraphObjExplorerComponent } from 'app/components/graph_object_explorer/graph_obj_explorer.component';
import { GraphViewerComponent } from 'app/components/graph_viewer/ui.graph_viewer.component';
import { ArangoService } from 'app/providers/arango.service';
import { D3Service } from 'd3-ng2-service';

describe("Tab content component", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TabContentComponent, AqlEditorComponent, GraphObjExplorerComponent, GraphViewerComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [ArangoService, D3Service, Renderer2]
        }).compileComponents;
    }));

    it("should check for sanity", () => {
        expect(1 + 1).toEqual(2);
    });
    
    it("should check that the component is created", () => {
        const fixture = TestBed.createComponent(TabContentComponent);
        const component = fixture.debugElement.componentInstance;
        expect(component).toBeTruthy();
    });
});