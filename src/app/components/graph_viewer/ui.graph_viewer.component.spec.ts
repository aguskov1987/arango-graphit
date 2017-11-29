import {GraphViewerComponent} from './ui.graph_viewer.component';

import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ArangoService } from 'app/providers/arango.service';

describe('Graph Viewer Component', () => {
    let fixture;
    let component;
    let rootSpy, docsSpy, relsSpy;

    let d1 = {_id: "d1", group: "A"};
    let d2 = {_id: "d2", group: "B"};
    let d3 = {_id: "d3", group: "B"};
    let r1 = {_id: "r1", _from: "d1", _to: "d2"};
    let r2 = {_id: "r2", _from: "d2", _to: "d3"};

    let arangoService: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GraphViewerComponent],
            providers: [ArangoService],
            schemas:[NO_ERRORS_SCHEMA]
          }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GraphViewerComponent);
        component = fixture.debugElement.componentInstance;
        arangoService = fixture.debugElement.injector.get(ArangoService);
        rootSpy = spyOn(arangoService, "loadDocumentById").and.returnValue(Promise.resolve(d1));
        docsSpy = spyOn(arangoService, "loadObjectGraphNodes").and.returnValue(Promise.resolve({
            all: () => {
                return Promise.resolve([d2, d3]);
            }
        }));
        relsSpy = spyOn(arangoService, "loadObjectGraphRels").and.returnValue(Promise.resolve({
            all: () => {
                return Promise.resolve([r1, r2]);
            }
        }));
    });

    it('should make sure the component is created', () => {
        expect(component).toBeTruthy();
    });

    it('should check that that colors are successfully added to the graph nodes', () => {
        component.data = [];
        component.data.push({data: {id: "d1", group: "A"}});
        component.data.push({data: {id: "d2", group: "B"}});
        component.data.push({data: {id: "d3", group: "B"}});
        component.data.push({data: {id: "r1", source: "1", target: "2"}});
        component.data.push({data: {id: "r2", source: "2", target: "3"}});
        component.addColors();

        expect(component.data[0].data.color).not.toBeUndefined();
        expect(component.data[1].data.color).toEqual(component.data[2].data.color);
        expect(component.data[0].data.color).not.toEqual(component.data[2].data.color);
    });

    it('should create a graph', fakeAsync(() => {
        component.showGraph("", "", 0, "");
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css("#cytoscapeContainer" + component.id))[0];
        
        expect(el.nativeElement.children[0].children[0].nodeName).toEqual("CANVAS");
    }));
});