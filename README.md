# arango-graphit

## Objectives
ArangoDB is a multi-data-model database which combines key-value storage, document storage as well as graph relations betwee the documents. This is a rather presumptuous attempt to create a tool which would help developers and database admins to manage arango databases. The primary focus of the project, at least for starters, is on graphs. In its first iteration, this management environment should provide the users with the following functionalities:

- Save/open AQL queries
- View database structure
- Compose and run AQL queries with the help of basic intelisense
- Add/remove databases, document collections, relation collections, graphs, graph vertex/relation collections, documents and relations
- Explore graphs of objects

## Inspirations
The project takes inspirations from a number of existing software such as:
- MS SQL Server Management Studio: layout of the UI components, database tree view, tabs layout
- Visual Studio Code: color scheme, tabs layout, tree view
- Jetbrains Webstorm and other Jetbrains products: color scheme, tan layout, tree view

## Technologies
- Electron
- Angular 2+
- Ace editor for AQL queries
- D3 for graph visualizations