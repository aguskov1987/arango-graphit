// region Imports
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import { TabContentComponent } from 'app/components/tabs/ui.tabContent.component';
import { AqlEditorComponent } from 'app/components/aql_editor/ui.aql_editor.component';
import { GraphObjExplorerComponent } from 'app/components/graph_object_explorer/graph_obj_explorer.component';
import { GraphViewerComponent } from 'app/components/graph_viewer/ui.graph_viewer.component';
import { ArangoService } from 'app/providers/arango.service';
import { TabType } from 'app/components/tabs/ui.tab.component';
import { AceEditorComponent } from 'ng2-ace-editor/src/component';
import { HttpModule } from '@angular/http';
// endregion

describe("Tab content component", () => {
    // Good idea to place the fixture and the component into global variables so each test has access to them
    let fixture;
    let component;

    // Call async beforeEach() to initialize test bed for components with external templates
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            declarations: [TabContentComponent, AqlEditorComponent, GraphObjExplorerComponent, GraphViewerComponent, AceEditorComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [ArangoService, Renderer2]
        }).compileComponents;
    }));
    
    // Create fixtures and components in synchronous beforeEach().
    // Run detectChanges on the fixture in case tests rely on view child components or they need to be spied on
    beforeEach(() => {
        fixture = TestBed.createComponent(TabContentComponent);
        component = fixture.debugElement.componentInstance;
        component.type = TabType.DbAQL;
        fixture.detectChanges();
        spyOn(component.aqlEditor, "focusOnEditor")
    });
    
    it("should check that the component is created", () => {
        expect(component).toBeTruthy();
    });

    it("should call the AQL Editor to focus when the tab switches from inactive to active", () => {
        let simpleChanges = {active: {previousValue: false, currentValue: true}}
        component.ngOnChanges(simpleChanges);
        expect(component.aqlEditor.focusOnEditor).toHaveBeenCalledTimes(1);
    });

    it("should not call the AQL Editor to focus when the tab switches from active to inactive", () => {
        let simpleChanges = {active: {previousValue: true, currentValue: false}}
        component.ngOnChanges(simpleChanges);
        expect(component.aqlEditor.focusOnEditor).toHaveBeenCalledTimes(0);
    });

    // Use fakeAsync wrapper if the method under test does any asynchronous work. In this case, there is a time out before the
    // focusOnEditor() is called
    it("should call the AQL Editor to focus when the tab is created (when 'type' property is initialized)", fakeAsync(() => {
        let simpleChanges = {type: {previousValue: null, currentValue: "not null"}}
        component.ngOnChanges(simpleChanges);
        tick(1500);
        expect(component.aqlEditor.focusOnEditor).toHaveBeenCalledTimes(1);
    }));
});