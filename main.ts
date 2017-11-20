import { app, BrowserWindow, screen, Menu, ipcMain, Point } from "electron";
import * as path from 'path';

import {ContextMenus} from "./context_menus";

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

if (serve) {
  require('electron-reload')(__dirname, {});
}

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({x: 0, y: 0, width: size.width, height: size.height});
  win.loadURL('file://' + __dirname + '/index.html');

  // Register context menus:
  let contMenus = new ContextMenus(win);
  ipcMain.on("graphRightClicked", (event, args) => {
    let mousePosition : Point = screen.getCursorScreenPoint();;
    contMenus.openGraphContextMenu(mousePosition.x, mousePosition.y - 45, args)
  })

  // Open the DevTools.
  if (serve) {
    win.webContents.openDevTools();
  }

  let menuTemplate : any = [
    {
      label: "File",
      submenu: [
        {label: "Open", click() {}},
        {label: "Open Recent", click() {}},
        {type: 'separator'},
        {label: "Save", accelerator: "CommandOrControl+S", click() {}},
        {label: "Save All", accelerator: "CommandOrControl+Shift+S", click() {}},
        {type: 'separator'},
        {label: "Exit", click() {}} 
    ]},
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
