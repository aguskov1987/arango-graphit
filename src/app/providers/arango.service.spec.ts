import { TestBed, async } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ArangoService } from 'app/providers/arango.service';
import {Http} from "@angular/http"

describe('Arango Service', () => {
    let service;
    let httpStub;

    beforeEach(() => {
        service = new ArangoService(httpStub);
    })

    it('should make sure the service is created', () => {
        expect(service).toBeTruthy();
    });

    it('should build a filter string', () => {
        let filter = service.buildFilter(["123", "abc", "789", "xyz"], "v");
        expect(filter).toEqual("FILTER v._id NOT IN ['123', 'abc', '789', 'xyz']")
    });

    it('should re-arrange tab dictionary when one a tab is closed', () => {
        service.tabTicks[0] = {dbId: "1", lastTick: "123"};
        service.tabTicks[1] = {dbId: "1", lastTick: "234"};
        service.tabTicks[3] = {dbId: "1", lastTick: "568"};

        expect(service.tabTicks).toBeTruthy();
        
        service.tabClosed(1);

        expect(service.tabTicks[0].lastTick).toEqual("123");
        expect(service.tabTicks[2].lastTick).toEqual("568");
    });
});