![GraphIt](src/assets/Images/icon_128x128.png)

# arango-graphit - Intro

## Objectives
ArangoDB is a multi-data-model database which combines key-value storage, document storage as well as graph relations betwee the documents. This is a rather presumptuous attempt to create a tool which would help developers and database admins to manage arango databases. The primary focus of the project, at least for starters, is on graphs. In its first iteration, this management environment should provide the users with the following functionalities:

- Save/open AQL queries
- View database structure
- Compose and run AQL queries with the help of basic intelisense
- Add/remove databases, document collections, relation collections, graphs, graph vertex/relation collections, documents and relations
- Explore graphs of objects

## Screenshots
![GraphIt](src/assets/Images/home_screen.png)
Home Screen: the left pane shows database and graph

![GraphIt](src/assets/Images/aql_int.png)
AQL Editor with intellisense (very basic right now)

![GraphIt](src/assets/Images/aql_results.png)
AQL results tab

![GraphIt](src/assets/Images/graph_explorer.png)
Graph Explorer with object preview

## Inspirations
The project takes inspirations from a number of existing software such as:
- MS SQL Server Management Studio: layout of the UI components, database tree view, tabs layout
- Visual Studio Code: color scheme, tabs layout, tree view
- Jetbrains Webstorm and other Jetbrains products: color scheme, tab layout, tree view

## Technologies
- Electron
- Angular 2+
- Ace editor for AQL queries
- Cytoscape for graph visualizations
- Prme NG for some user controls


# Project Development

## Building the project for development
- Clone the repository
- Install the dependancies with 'npm install'
- To start the dev server: open a command window and run 'npm start'
- Copy the mode-aql.js file from the root directory into the newly buit 'dist' folder
- To start electron app: open another command window and run 'npm run electron:serve'
- The application should start in hot reload mode. Once you make any changes to the Angular app, electron will reload to reflect the changes. Keep in mind that the once you make any changes to the main process code, electron will not hot reload and you will have to manually restart step 5
- I have not implemented credentials storage yet so the username and password are currently stored as variables in the app/common/Store.ts change those to access your database

### Known issues with the build process
- After installing the dependencies and try to run the app, you might run into the following error - "list" argument must be an Array of Buffers. The error is coming from node_modules/buffer.index.js, in the *concat* function even though the passed **buf** object is a *Buffer*:
```javascript
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
```
The issue can be corrected by commenting out the exception but will need to investigate a more reliable fix

## Roadmap to alpha release
### Primary features
- Connect to server window - currently the user credentials are hardwired in the code. Need to add an option to enter these details in a separate window and have the system remeber the credentials
- Table view for aql queries - similar to the original web app bundled with arango
- Graph label mappings - when the user enters details for graph view, there is an option to indicate what field to use to show node labels. Sometimes the field is not very explicit (for example, it can be a int document type). I would be nice to have a stored map for this types of fields so the graph would actually show proper names chosen by the user
- Graph change updates (I am curently working on it) - I found it difficult to track what happens to a graph when performing an operation and then checking whether all nodes and relations are updated properly. For this reason, I am implementing a graph tracker which would watch the graph and reflect any updated

### Standard features not implemented yet
- Save AQL query, save all
- Open AQL query, open recent
- Buttons for cut, copy and paste still need to get wired
