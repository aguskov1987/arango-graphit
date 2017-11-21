import { Menu, MenuItem } from "electron"

enum NewTabArgsType {
    NewDbQuery,
    NewGraphQuery
}

export class ContextMenus {
    public window: any;
    public graphMenu: Menu;
    public dbMenu: Menu;

    private parameters: any = null;

    constructor(winObj: any) {
        this.window = winObj;

        this.graphMenu = new Menu();
        this.graphMenu.append(new MenuItem({
            label: "New Query", click: () => {
                this.window.webContents.send("open_graph_query_msg", { params: this.parameters });
            }
        }
        ));
        this.graphMenu.append(new MenuItem({
            label: "Open Object Explorer", click: () => {
                this.window.webContents.send("open_obj_explorer_msg", { params: this.parameters });
            }
        }
        ));
        this.graphMenu.append(new MenuItem({
            label: "Add Vertex Collection", click: () => {
                this.window.webContents.send("add_graph_vertex_collection_msg", { params: this.parameters });
            }
        }
        ));
        this.graphMenu.append(new MenuItem({
            label: "Add Relation Collection", click: () => {
                this.window.webContents.send("add_graph_relation_collection_msg", { params: this.parameters });
            }
        }
        ));

        this.dbMenu = new Menu();
        this.dbMenu.append(new MenuItem({
            label: "New Query", click: () => {
                this.parameters.type = NewTabArgsType.NewDbQuery;
                this.window.webContents.send("open_db_query_msg", { params: this.parameters });
            }
        }
        ));
        this.dbMenu.append(new MenuItem({
            label: "Add Graph", click: () => {
                this.window.webContents.send("add_graph_msg", { params: this.parameters });
            }
        }
        ));
        this.dbMenu.append(new MenuItem({
            label: "Add Document Collection", click: () => {
                this.window.webContents.send("add_db_document_collection", { params: this.parameters });
            }
        }
        ));
        this.dbMenu.append(new MenuItem({
            label: "Add Relation Collection", click: () => {
                this.window.webContents.send("add_db_relation_collection", { params: this.parameters });
            }
        }
        ));
    }

    public openGraphContextMenu(x: number, y: number, params: any) {
        this.parameters = params;
        this.graphMenu.popup(this.window, { x: x, y: y });
    }

    public openDbContextMenu(x: number, y: number, params: any) {
        this.parameters = params;
        this.dbMenu.popup(this.window, { x: x, y: y });
    }
}