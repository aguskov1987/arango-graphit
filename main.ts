import { app, BrowserWindow, screen, Menu, ipcMain, Point, dialog } from "electron";
import * as path from 'path';
import {ContextMenus} from "./context_menus";

// user preferences and other data persistence
const Store = require("electron-store");
const store = new Store();

let win: BrowserWindow, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

if (serve) {
  require('electron-reload')(__dirname, {});
}

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({x: 0, y: 0, width: size.width, height: size.height, icon: path.join(__dirname + "/assets/Images/icon_64x64.png")});
  // and load the index.html of the app.
  win.loadURL('file://' + __dirname + '/index.html');

  // Register context menus
  let contMenus = new ContextMenus(win);
  // args is of type Command (common -> command.type.ts)
  ipcMain.on("graphRightClicked", (event, args) => {
    contMenus.openGraphContextMenu(args.x, args.y, args.command)
  })
  ipcMain.on("dbRightClicked", (event, args) => {
    contMenus.openDbContextMenu(args.x, args.y, args.command)
  })

  // Open the DevTools.
  // Comment this one out if using VS Code debugging
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
        {label: "Save", accelerator: "CommandOrControl+S", click() {
          dialog.showSaveDialog(win, {})
        }},
        {label: "Save All", accelerator: "CommandOrControl+Shift+S", click() {}},
        {type: 'separator'},
        {role: 'close'} 
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
    store.set("window_maximized", win.isMaximized());
    store.set("window_height", win.getSize()[1]);
    store.set("window_width", win.getSize()[0]);
    win = null;
  });
}

try {
  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
