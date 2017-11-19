import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, remote, Menu } from 'electron'
import * as childProcess from 'child_process';
import * as fs from 'fs'

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  childProcess: typeof childProcess;

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
