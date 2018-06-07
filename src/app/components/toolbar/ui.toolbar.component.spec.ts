import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { ToolbarComponent, AqlResultsView } from "app/components/toolbar/ui.toolbar.component";
import { NO_ERRORS_SCHEMA, DebugElement } from "@angular/core";
import { By } from '@angular/platform-browser';
import { StoreUtils } from "app/common/store";

describe('Toolbar Component', () => {
    let fixture: ComponentFixture<ToolbarComponent>;
    let component: ToolbarComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ToolbarComponent],
            providers: [],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolbarComponent);
        component = fixture.debugElement.componentInstance;
        fixture.detectChanges();
    });

    it('should make sure the component is created', () => {
        expect(component).toBeTruthy();
    });

    it('should check whether all buttons are initially in their default state', () => {
        let de: DebugElement = fixture.debugElement;
        let buttons = de.queryAll(By.css(".default-button-state"));

        expect(buttons.length).toBe(4);
    });

    it('should disable and enable clipboard buttons', () => {
        component.enableAql();
        component.enableClipboard();
        component.enableTracking();
        component.disableClipboard();
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let activeButtons = de.queryAll(By.css(".default-button-state"));
        let disabledButtons = de.queryAll(By.css(".disabled-button-state"))

        expect(activeButtons.length).toBe(9);
        expect(disabledButtons.length).toBe(3);

        component.enableClipboard();
        fixture.detectChanges();
        de = fixture.debugElement;
        activeButtons = de.queryAll(By.css(".default-button-state"));

        expect(activeButtons.length).toBe(12);
    });

    it('should disable and enable AQL buttons', () => {
        component.enableAql();
        component.enableClipboard();
        component.enableTracking();
        component.disableAql();
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let activeButtons = de.queryAll(By.css(".default-button-state"));
        let disabledButtons = de.queryAll(By.css(".disabled-button-state"))

        expect(activeButtons.length).toBe(9);
        expect(disabledButtons.length).toBe(3);

        component.enableAql();
        fixture.detectChanges();
        de = fixture.debugElement;
        activeButtons = de.queryAll(By.css(".default-button-state"));

        expect(activeButtons.length).toBe(12);
    });

    it('should disable and enable tracking buttons', () => {
        component.enableAql();
        component.enableClipboard();
        component.enableTracking();
        component.disableTracking();
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let activeButtons = de.queryAll(By.css(".default-button-state"));
        let disabledButtons = de.queryAll(By.css(".disabled-button-state"))

        expect(activeButtons.length).toBe(10);
        expect(disabledButtons.length).toBe(2);

        component.enableTracking();
        fixture.detectChanges();
        de = fixture.debugElement;
        activeButtons = de.queryAll(By.css(".default-button-state"));

        expect(activeButtons.length).toBe(12);
    });

    it('should adjust the toolbar when an AQL tab is activated', () => {
        component.aqlTabClicked(AqlResultsView.Table);
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let onButton = de.queryAll(By.css(".on-button-state"));
        
        expect(onButton.length).toBe(1);
    });

    it('should configure tool bar when a graph tab is activated', () => {
        // StoreUtils.globalEventEmitter.emit("tab_clicked", {type: 2, id: 1, tracking: true});
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let buttons = de.queryAll(By.css(".default-button-state"));
        let inactiveButtons = de.queryAll(By.css(".disabled-button-state"));
        let onButtons = de.queryAll(By.css(".on-button-state"));

        expect(buttons.length).toBe(5);
        expect(inactiveButtons.length).toBe(6);
        expect(onButtons.length).toBe(1);
    });

    it('should re-configure the toolbar when the Start Tracking button is off and clicked', () => {
        // StoreUtils.globalEventEmitter.emit("tab_clicked", {type: 2, id: 1, tracking: true});
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let startTrackButton = de.queryAll(By.css(".btn"))[10];
        startTrackButton.nativeElement.click();
        fixture.detectChanges();
        expect(startTrackButton.classes['on-button-state']).toBeTruthy();
    });

    it('should turn off tracking if enabled when the Stop Tracking button is clicked', () => {
        // StoreUtils.globalEventEmitter.emit("tab_clicked", {type: 3, id: 1, tracking: true});
        fixture.detectChanges();
        let de: DebugElement = fixture.debugElement;
        let stopTrackButton = de.queryAll(By.css(".toolstrip > div"))[15];
        stopTrackButton.nativeElement.click();
        fixture.detectChanges();
        let startTrackButton = de.queryAll(By.css(".toolstrip > div"))[14];
        
        expect(startTrackButton.classes['on-button-state']).toBeFalsy();
    });
});
