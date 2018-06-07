import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'test-component',
    template: `
        <form>
            <div>
                <textarea [(ngModel)]="variable" rows="3"></textarea>
            </div>
        </form>
    `
})
export class TestComponent implements OnInit {
    public variable: string = "";

    constructor() { }

    public ngOnInit() { }

    public populate(v: string) {
        this.variable = v;
    }
}