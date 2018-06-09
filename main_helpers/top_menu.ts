import { BrowserWindow, dialog } from "electron";

export class TopMenu {
    public static getMenu(window: BrowserWindow) {
        let menuTemplate: any = [
            {
                label: "File",
                submenu: [
                    { label: "Open", click() { } },
                    { label: "Open Recent", click() { } },
                    { type: 'separator' },
                    {
                        label: "Save", accelerator: "CommandOrControl+S", click() {
                            dialog.showSaveDialog(window, {})
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
                    { label: 'Graph Label Mappings', click() { window.webContents.send("open_label_mappings") } }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    { label: 'About GraphIt', click() { } }
                ]
            }
        ];
        return menuTemplate;
    }
}