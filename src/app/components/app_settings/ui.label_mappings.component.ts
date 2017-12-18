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
        let existing = this.maps.find((m) => m.dbName === this.dbName && m.property === this.property);

        // If it is a new entry
        if (existing == null) {
            let newEntry = {dbName: this.dbName, property: this.property, displayName: this.dbName + " " + this.property, mappings: {}};
            for (let n of this.names) {
                newEntry.mappings[n[0]] = n[1];
            }
            this.maps.push(newEntry);
        }
        // If the entry already exists
        else {
            existing.dbName = this.dbName;
            existing.property = this.property;
            existing.displayName = this.dbName + " " + this.property;

            existing.mappings = {};
            for (let n of this.names) {
                existing.mappings[n[0]] = n[1];
            }
        }
        this.electronService.ipcRenderer.send("setLabelMappings", this.maps);
    }

    public onChange(mapping: LabelMapping) {
        this.dbName = mapping.dbName;
        this.property = mapping.property;

        this.names = [];
        for (var key in mapping.mappings) {
            this.names.push([key, mapping.mappings[key]]);
        }
    }
}