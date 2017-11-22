import { Injectable } from '@angular/core';
import { ipcRenderer, remote, Menu } from 'electron'
import * as childProcess from 'child_process';
import * as fs from 'fs'

@Injectable()
export class ElectronService {

  public ipcRenderer: typeof ipcRenderer;
  public childProcess: typeof childProcess;

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = ipcRenderer;
      this.childProcess = childProcess;
    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }
}
