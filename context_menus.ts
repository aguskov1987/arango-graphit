import { Menu, MenuItem } from "electron"

export class ContextMenus {
    public window: any;
    public graphMenu: Menu;

    private parameters: any = null;

    constructor(winObj: any) {
        this.window = winObj;

        this.graphMenu = new Menu();
        this.graphMenu.append(new MenuItem({
            label: "New Query", click: () => {
                this.window.webContents.send("open_query_msg", { params: this.parameters });
            }
        }
        ));
        this.graphMenu.append(new MenuItem({
            label: "Open Object Explorer", click: () => {
                this.window.webContents.send("open_obj_explorer_msg", { params: this.parameters });
            }
        }
        ));
    }

    public openGraphContextMenu(x: number, y: number, params: any) {
        this.parameters = params;
        this.graphMenu.popup(this.window, { x: x, y: y });
    }
}