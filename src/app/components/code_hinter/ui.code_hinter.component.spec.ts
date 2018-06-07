import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CodeHinterComponent } from 'app/components/code_hinter/ui.code_hinter.component';

describe('Code Hinter Component', () => {
    let fixture: ComponentFixture<CodeHinterComponent>;
    let component: CodeHinterComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CodeHinterComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: []
        })
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CodeHinterComponent);
        component = fixture.debugElement.componentInstance;
        fixture.detectChanges();
    });

    it('should make sure the component is created', () => {
        expect(component).toBeTruthy();
    });

    it('should make sure all keyword and function options are initially loaded ', () => {
        expect((<any>component).keywordOptions.length).toEqual(32);
        expect((<any>component).functionOptions.length).toEqual(131);
    });

    it('should populate document and relation collections', () => {
        component.populateCollectionOptions();

        expect((<any>component).docCollectionOptions.length).toEqual(2);
        expect((<any>component).relCollectionOptions.length).toEqual(1);
    });

    it('should only show compatable options when given a string to compare to', () => {
        component.populateCollectionOptions();
        component.addVariableOption("variable");
        component.updateOptionsList("IN");
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css(".option"));

        expect(el.length).toEqual(21);
        expect(component.optionsAvailable).toBeTruthy();
    });

    it('should not have any options available if a given string does not match any words', () => {
        component.updateOptionsList("abc");
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css(".option"));

        expect(el.length).toEqual(0);
        expect(component.optionsAvailable).toBeFalsy();
    });

    it('should indicate that there is only one option available given a certain word to match', () => {
        component.updateOptionsList("INBOUND");
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css(".selectedOption"));

        expect(el.length).toEqual(1);
        expect(component.isOneOptionAndSameAsToken("INBOUND")).toBeTruthy();
    });

    it('should position the hinter in the view if it is called to show and there are options to display', () => {
        component.updateOptionsList("IN");
        fixture.detectChanges();
        component.showHinter(['100px', '100px']);
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css(".codeHinter"));

        expect(el.length).toEqual(1);

        let nElement = el[0].nativeElement;

        expect(nElement.style.top).toEqual("100px");
        expect(nElement.style.left).toEqual("100px");
        expect((<any>component).active).toBeTruthy();
    });

    it('should not position the hinter and leave it out of view if it is called to show but there are no options to display', () => {
        component.updateOptionsList("abc");
        fixture.detectChanges();
        component.showHinter(['100px', '100px']);
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css(".codeHinter"));

        expect(el.length).toEqual(1);

        let nElement = el[0].nativeElement;

        expect(nElement.style.top).toEqual("-500px");
        expect(nElement.style.left).toEqual("-500px");
        expect((<any>component).active).toBeFalsy();
    });

    it('should remove the hinter from the view if hide is called', () => {
        component.updateOptionsList("IN");
        fixture.detectChanges();
        component.showHinter(['100px', '100px']);
        fixture.detectChanges();
        component.hideHinter();
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let el = de.queryAll(By.css(".codeHinter"));

        expect(el.length).toEqual(1);

        let nElement = el[0].nativeElement;

        expect(nElement.style.top).toEqual("-500px");
        expect(nElement.style.left).toEqual("-500px");
        expect((<any>component).active).toBeFalsy();
    });
});