import { GraphViewerComponent } from './ui.graph_viewer.component';

import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { HttpModule } from '@angular/http';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ArangoService } from 'app/providers/arango.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of'

describe('Graph Viewer Component', () => {
    let fixture;
    let component;
    let rootSpy, docsSpy, relsSpy, dbChangesSpy;

    let d1 = { _id: "A/d1", _key: "d1" }; // root

    let d2 = { _id: "B/d2", _key: "d2" }; // level 1
    let d3 = { _id: "B/d3", _key: "d3" }; // level 1

    let d4 = { _id: "C/d4", _key: "d4" }; // level 2
    let d5 = { _id: "C/d5", _key: "d5" }; // level 2
    let d6 = { _id: "C/d6", _key: "d6" }; // level 2

    let d7 = { _id: "D/d7", _key: "d7" }; // level 3

    let r1 = { _id: "r1", _from: "A/d1", _to: "B/d2" };
    let r2 = { _id: "r2", _from: "A/d1", _to: "B/d3" };

    let r3 = { _id: "r3", _from: "B/d2", _to: "C/d4" };
    let r4 = { _id: "r4", _from: "B/d2", _to: "C/d5" };
    let r5 = { _id: "r5", _from: "B/d3", _to: "C/d6" };

    let r6 = { _id: "r6", _from: "C/d5", _to: "D/d7" };
    let r7 = { _id: "r7", _from: "C/d6", _to: "D/d7" };

    let arangoService: any;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            declarations: [GraphViewerComponent],
            providers: [ArangoService],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GraphViewerComponent);
        component = fixture.debugElement.componentInstance;
        arangoService = fixture.debugElement.injector.get(ArangoService);
        rootSpy = spyOn(arangoService, "loadDocumentById").and.returnValue(Promise.resolve(d1));

        docsSpy = spyOn(arangoService, "loadObjectGraphNodes").and.returnValue(Promise.resolve({
            all: () => {
                return Promise.resolve([d2, d3, d4, d5, d6, d7]);
            }
        }));

        relsSpy = spyOn(arangoService, "loadObjectGraphRels").and.returnValue(Promise.resolve({
            all: () => {
                return Promise.resolve([r1, r2, r3, r4, r5, r6, r7]);
            }
        }));

        dbChangesSpy = spyOn(arangoService, "stopTrackingGraph").and.returnValue(Observable.of(
            [{ tick: 22541, type: 2300, database: 2145, cname: "A", data: { _id: "C/d5", _key: "d5", addedValue: 1 } }]
        ))
    });

    it('should make sure the component is created', () => {
        expect(component).toBeTruthy();
    });

    it('should check that that colors are successfully added to the graph nodes', () => {
        component.data = [];
        component.data.push({ data: { id: "d1", group: "A" } });
        component.data.push({ data: { id: "d2", group: "B" } });
        component.data.push({ data: { id: "d3", group: "B" } });
        component.data.push({ data: { id: "r1", source: "1", target: "2" } });
        component.data.push({ data: { id: "r2", source: "2", target: "3" } });
        component.addColors();

        expect(component.data[0].data.color).not.toBeUndefined();
        expect(component.data[1].data.color).toEqual(component.data[2].data.color);
        expect(component.data[0].data.color).not.toEqual(component.data[2].data.color);
    });

    it('should create a graph in a canvas', fakeAsync(() => {
        component.showGraph("", "", 0, "");
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css("#cytoscapeContainer" + component.id))[0];

        expect(el.nativeElement.children[0].children[0].nodeName).toEqual("CANVAS");
    }));

    it('should store the reference to the Cytoscape object', fakeAsync(() => {
        component.showGraph("", "", 0, "");
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(component.cytoscapeContext).not.toBeUndefined();
        expect(component.cytoscapeContext.getElementById("A_d1")).not.toBeUndefined();
    }));

    it('should find the changed value in the graph and update it add a new value to the nodes data', fakeAsync(() => {
        component.showGraph("", "", 0, "");
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        component.updateGraph();
        let node = component.cytoscapeContext.getElementById("C_d5");

        expect(node.data().delta).toBeTruthy();
    }));
});