import {ObjectViewerComponent} from './ui.object_viewer.component';
import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

describe('Object Viewer Component', () => {
    let fixture;
    let component;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ObjectViewerComponent],
            providers: [],
            schemas:[NO_ERRORS_SCHEMA]
          }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ObjectViewerComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should make sure the component is created', () => {
        expect(component).toBeTruthy();
    });

    it('should create an asset when an object is passed', () => {
        let obj = [{make: "VW", model: "Tiguan", year: 2012}]
        component.json = obj;
        fixture.detectChanges();
        component.ngOnInit();
        
        expect(component.asset).not.toBeUndefined();
        expect(component.asset.length).toEqual(1);
    });

    it('should make sure the added item is of type object', () => {
        let obj = [{make: "VW", model: "Tiguan", year: 2012}]
        component.json = obj;
        fixture.detectChanges();
        component.ngOnInit();
        expect(component.isObject(component.asset[0])).toEqual(true);
    });

    it('should make sure that the item is initially closed but opens after click', () => {
        let obj = [{make: "VW", model: "Tiguan", year: 2012}]
        component.json = obj;
        fixture.detectChanges();
        component.ngOnInit();

        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css(".fa-plus"));

        expect(el.length).toEqual(1);

        component.clickHandle(component.asset[0]);
        fixture.detectChanges();

        el = de.queryAll(By.css(".fa-plus"));
        expect(el.length).toEqual(0);
        el = de.queryAll(By.css(".fa-minus"));
        expect(el.length).toEqual(1);
    });

    it('should make sure inner items are displayed after the "open" button is clicked,', () => {
        let obj = [{make: "VW", model: "Tiguan", year: 2012}]
        component.json = obj;
        component.ngOnInit();
        component.clickHandle(component.asset[0]);
        fixture.detectChanges();

        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css("object-viewer"));
        expect(el.length).toEqual(1);

        el = de.queryAll(By.css(".item__value"));
        expect(el.length).toEqual(4);
    });
});