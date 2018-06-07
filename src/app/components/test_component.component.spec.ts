import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestComponent } from 'app/components/test_component.component';
import { FormsModule } from '@angular/forms';

describe('test component suite', () => {
    let fixture;
    let component: TestComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [],
            schemas:[NO_ERRORS_SCHEMA],
            imports: [FormsModule]
          }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.debugElement.componentInstance;
    });

    it('should make sure the variable is updated', () => {
        component.populate("new value");
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            let de: DebugElement = fixture.debugElement;
            let ta = de.query(By.css("textarea"));
            console.log(ta.nativeElement);
        });
    });
});