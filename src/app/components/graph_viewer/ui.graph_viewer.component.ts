/**
 * Created by Andrey on 9/29/2017.
 */
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { D3Service, D3 } from "d3-ng2-service";
import { ArangoService } from "../../providers/arango.service";

interface INode {
  id : string;
  group : number;
  document : any;
}

interface IConnection {
  id : string;
  source : string;
  target : string;
  relation : any;
}

@Component({
  moduleId: module.id,
  selector: "graph-viewer",
  templateUrl: "ui.graph_viewer.component.html",
})
export class GraphViewerComponent implements OnInit {
  @Output() public linkHovered = new EventEmitter();
  @Output() public nodeHovered = new EventEmitter();
  @Output() public linkOut = new EventEmitter();
  @Output() public nodeOut = new EventEmitter();

  private d3 : D3;
  private arangoServer : ArangoService;
  private data : any;

  constructor(d3Service : D3Service, aService : ArangoService) {
    this.arangoServer = aService;
    this.d3 = d3Service.getD3();
    this.data = { nodes: [], links: [] };
  }

  public ngOnInit() {
    let d3 = this.d3;
    let svg = this.d3.select("svg");
    let group = svg.append("g").attr("class", "everything");
    let width = +svg.attr("width");
    let height = +svg.attr("height");
    let color = this.d3.scaleOrdinal(this.d3.schemeCategory20);
    let node_hovered = this.nodeHovered;
    let node_out = this.nodeOut;
    let link_hovered = this.linkHovered;
    let link_out = this.linkOut;
    let transform_factor : any = {k : 1, x : 0, y : 0};
    let allow_transform : boolean = true;

    // region Arrow heads
    svg.append("svg:defs").selectAll("marker")
      .data(["end"])
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    svg.append("svg:defs").selectAll("marker")
      .data(["hovered_end"])
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#991716");
    // endregion

    svg.on("mousemove", mouseMove);

    // Force simulation
    let sim : any = this.d3.forceSimulation()
      .force("link", this.d3.forceLink<INode, IConnection>().id((d) => d.id).distance(200).strength(0.05))
      .force("charge", this.d3.forceManyBody())
      .force("center", this.d3.forceCenter(width / 2, height / 2));

    // Links
    let link = group.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.data.links)
      .enter().append("line")
      .attr("stroke-width", "2px")
      .attr("stroke", "#999")
      .attr("marker-end", "url(#end)");

    // Nodes
    let node = group.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(this.data.nodes)
      .enter().append("circle")
      .attr("r", 15)
      .attr("fill", (d) => color((d as INode).group.toString()))
      .attr("stroke", "#fff")
      .attr("stroke-width", "1.5px")
      .on("mouseover", nodeMouseOver)
      .on("mouseout", nodeMouseOut)
      .call(this.d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded));

    // Add foreign object
    // d3.selectAll(".nodes")
    //   .append("foreignObject")
    //   .attr("x", 50).attr("y", 50).attr("width", 50).attr("height", 50)
    //   .append("xhtml:div")
    //   .append("div").text("test");

    sim.nodes(this.data.nodes).on("tick", ticked);
    sim.force("link").links(this.data.links);

    let zoom_handler = d3.zoom().on("zoom", zoom_actions);
    zoom_handler(svg as any);

    function ticked() {
      link
        .attr("x1", (d) => { return (d as any).source.x; })
        .attr("y1", (d) => { return (d as any).source.y; })
        .attr("x2", (d) => { return (d as any).target.x; })
        .attr("y2", (d) => { return (d as any).target.y; });

      node
        .attr("cx", (d) => { return (d as any).x; })
        .attr("cy", (d) => { return (d as any).y; });
    }

    function dragStarted(d) {
      if (!d3.event.active) {
        sim.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragEnded(d) {
      if (!d3.event.active) {
        sim.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    }

    let currentLinkId : any = null;
    function mouseMove() {
      // Reset colors
      d3.selectAll("line").attr("stroke", "#999").attr("marker-end", "url(#end)");
      let mouseX = d3.mouse(this)[0];
      let mouseY = d3.mouse(this)[1];

      let lineCounter : number = 0;

      let linkSelection = d3.selectAll("line")
        .filter((line : any) => {

        let sourceX = line.source.x * transform_factor.k + transform_factor.x;
        let sourceY = line.source.y * transform_factor.k + transform_factor.y;
        let targetX = line.target.x * transform_factor.k + transform_factor.x;
        let targetY = line.target.y * transform_factor.k + transform_factor.y;

        let pointDis = distanceFromPoints(sourceX, sourceY, targetX, targetY);
        let dis1 = distanceFromPoints(sourceX, sourceY, mouseX, mouseY);
        let dis2 = distanceFromPoints(targetX, targetY, mouseX, mouseY);
        if (dis1 + dis2 < (pointDis + (pointDis * 0.001)) && lineCounter !== 1) {
          lineCounter++;
          return true;
        }
        else {
          return false;
        }
      });
      if (linkSelection.empty()) {
        link_out.emit();
        currentLinkId = null;
      }
      else {
        linkSelection
          .attr("stroke", "#991716")
          .attr("marker-end", "url(#hovered_end)");

        if ((linkSelection.datum() as IConnection).id !== currentLinkId) {
          link_hovered.emit((linkSelection.datum() as IConnection).id);
          currentLinkId = (linkSelection.datum() as IConnection).id;
        }
      }
    }

    function nodeMouseOver(nd) {
      node_hovered.emit(nd.id);
    }

    function zoom_actions() {
      if (allow_transform) {
        group.attr("transform", d3.event.transform);
        transform_factor = d3.event.transform;
      }
    }

    function nodeMouseOut() {
      node_out.emit();
    }

    function distanceFromPoints(x1, y1, x2, y2) {
      let a = x1 - x2;
      let b = y1 - y2;
      return Math.sqrt( a * a + b * b );
    }
  }

  public showGraph(nodeId : string, dir : string, depth : number, label : string) {
    let docsCall = this.arangoServer.loadObjectGraphNodes(nodeId, dir, depth);
    let relsCall = this.arangoServer.loadObjectGraphRels(nodeId, dir, depth);

    Promise.all([docsCall, relsCall]).then((response) => {
      let docsCursor = response[0];
      let relsCursor = response[1];

      this.data.nodes = [];
      this.data.links = [];
      docsCursor.all().then((docs) => {
        docs.forEach((doc) => {
          if (doc != null) {
            let node : INode = {id: doc._id, group: doc._id.split("/")[0], document: doc};
            this.data.nodes.push(node);
          }
        });

        relsCursor.all().then((rels) => {
          rels.forEach((rel) => {
            if (rel != null) {
              let link : IConnection = {source: rel._from, target: rel._to, id: rel._id, relation: rel};
              this.data.links.push(link);
            }
          });

          // TODO: graph init goes here
        });
      });
    });
  }
}
