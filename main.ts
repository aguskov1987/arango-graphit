import { app, BrowserWindow, screen, Menu, ipcMain, Point, dialog } from "electron";
import * as path from 'path';
import { ContextMenus } from "./context_menus";

// user preferences and other data persistence
const Store = require("electron-store");
const store = new Store();

let win: BrowserWindow;
const args = process.argv.slice(1);
let serve = args.some(val => val === '--serve');

if (serve) {
  require('electron-reload')(__dirname, {});
}

let windowWidth: number;
let windowHeight: number;
let max: boolean;

function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  let w = store.has("window_width") ? store.get("window_width") : size.width;
  let h = store.has("window_height") ? store.get("window_height") : size.height;

  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: w,
    height: h,
    icon: path.join(__dirname + "/assets/Images/icon_64x64.png")
  });
  windowWidth = w;
  windowHeight = h;

  if (store.has("window_maximized") && store.get("window_maximized") === true) {
    win.maximize();
    max = true;
  }
  // and load the index.html of the app.
  win.loadURL('file://' + __dirname + '/index.html');
  win.on("resize", () => {
    windowHeight = win.getSize()[1];
    windowWidth = win.getSize()[0];
  });
  win.on("maximize", () => max = true);
  win.on("unmaximize", () => max = false);

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

  let menuTemplate: any = [
    {
      label: "File",
      submenu: [
        { label: "Open", click() {} },
        { label: "Open Recent", click() { } },
        { type: 'separator' },
        {
          label: "Save", accelerator: "CommandOrControl+S", click() {
            dialog.showSaveDialog(win, {})
          }
        },
        { label: "Save All", accelerator: "CommandOrControl+Shift+S", click() { } },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' },
      { role: 'paste' }, { role: 'delete' }, { role: 'selectall' }
      ]
    },
    {
      label: 'Preferences',
      submenu: [
        {label: 'Graph Label Mappings', click() {win.webContents.send("open_label_mappings")}}
      ]
    },
    {
      label: 'Help',
      submenu: [
        {label: 'About GraphIt', click() {}}
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Emitted when the window is closed.
  win.on('closed', () => {
    store.set("window_maximized", max);
    store.set("window_height", windowHeight);
    store.set("window_width", windowWidth);
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
