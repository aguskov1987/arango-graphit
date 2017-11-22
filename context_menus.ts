import { Menu, MenuItem } from "electron"

export class ContextMenus {
    public window: any;
    public graphMenu: Menu;
    public dbMenu: Menu;

    private command: any = null;

    constructor(winObj: any) {
        this.window = winObj;

        this.graphMenu = new Menu();
        this.graphMenu.append(new MenuItem({
            label: "New Query", click: () => {
                this.window.webContents.send("open_graph_query_msg", this.command);
            }
        }
        ));
        this.graphMenu.append(new MenuItem({
            enabled: false,
            label: "Open Object Explorer", click: () => {
                this.window.webContents.send("open_obj_explorer_msg",  this.command);
            }
        }
        ));
        this.graphMenu.append(new MenuItem({
            enabled: false,
            label: "Add Vertex Collection", click: () => {
                this.window.webContents.send("add_graph_vertex_collection_msg", this.command);
            }
        }
        ));
        this.graphMenu.append(new MenuItem({
            enabled: false,
            label: "Add Relation Collection", click: () => {
                this.window.webContents.send("add_graph_relation_collection_msg", this.command);
            }
        }
        ));

        this.dbMenu = new Menu();
        this.dbMenu.append(new MenuItem({
            label: "New Query", click: () => {
                this.window.webContents.send("open_db_query_msg", this.command);
            }
        }
        ));
        this.dbMenu.append(new MenuItem({
            enabled: false,
            label: "Add Graph", click: () => {
                this.window.webContents.send("add_graph_msg", this.command);
            }
        }
        ));
        this.dbMenu.append(new MenuItem({
            enabled: false,
            label: "Add Document Collection", click: () => {
                this.window.webContents.send("add_db_document_collection", this.command);
            }
        }
        ));
        this.dbMenu.append(new MenuItem({
            enabled: false,
            label: "Add Relation Collection", click: () => {
                this.window.webContents.send("add_db_relation_collection", this.command );
            }
        }
        ));
    }

    public openGraphContextMenu(x: number, y: number, command: any) {
        this.command = command;
        this.graphMenu.popup(this.window, { x: x, y: y });
    }

    public openDbContextMenu(x: number, y: number, command: any) {
        this.command = command;
        this.dbMenu.popup(this.window, { x: x, y: y });
    }
}