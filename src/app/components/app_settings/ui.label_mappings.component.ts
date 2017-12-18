import { Component, OnInit } from '@angular/core';
import { LabelMapping } from 'app/common/types/label_mapping.type';
import { SelectItem } from 'primeng/primeng';
import { ElectronService } from 'app/providers/electron.service';

@Component({
    moduleId: module.id,
    selector: 'label-mappings',
    templateUrl: 'ui.label_mappings.component.html',
    styleUrls: ['ui.label_mappings.component.scss']
})
export class LabelMappingsComponent implements OnInit {
    public dbName: string = "";
    public property: string = "";
    public names: [string, string][] = [];

    public maps: LabelMapping[] = [];
    public selectedMap: LabelMapping;

    private electronService: ElectronService;

    constructor(es: ElectronService) {
        this.electronService = es;
        this.maps = this.electronService.ipcRenderer.sendSync("getLabelMappings", null);
    }

    public ngOnInit() { }

    public add() {
        this.names.push(["", ""]);
    }

    public remove(name: [string, string]) {
        const index = this.names.indexOf(name);
        if (index !== -1) {
            this.names.splice(index, 1);
        }
    }

    public save() {
    }

    public onChange(mapping: LabelMapping) {
        
    }
}