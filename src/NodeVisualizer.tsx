import React from 'react';
import * as D3 from "d3";
import {SerializedMasterController} from "../SharedTypes";

const RADIUS = 10;

type Node = {
    id:string,
    group:number,
    cx:number,
    cy:number,
};
type Link = {
    source:string,
    target:string,
    value:number,
};

class NodeVisualizer extends React.Component<{nodeData:string}, {}> {
    private svg:any;
    constructor(props) {
        super(props);
        this.svg = null;
    }

    componentDidMount() {
        const N = 100;
        const data = {
            nodes: Array.apply(null, Array(N)).map((_, index):Node => {
                return {
                    id: "c" + index,
                    group: index % 10,
                    cx: Math.floor(Math.random() * 1500),
                    cy: Math.floor(Math.random() * 1500),
                }
            }),
            links: Array.apply(null, Array(N)).map((_, index):Link => {
                return {
                    source: "c" + Math.floor(Math.random() * N),
                    target: "c" + Math.floor(Math.random() * N),
                    value: Math.floor(Math.random() * 5),
                };
            }),
        };
        this.svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);
        /*this.svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);*/
    }

    update(args: {
        nodes:Array<Node>,
        links:Array<Link>,
    }) {
        const nodes = args.nodes.map(d => Object.create(d));
        const node = this.svg
            .selectAll("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 10)
            .attr("fill", "red")
            .attr("cx", d => d.cx)
            .attr("cy", d => d.cy)
            .attr("id", d => d.id);

        const links = args.links.map(d => Object.create(d));
        const link = this.svg
            .selectAll("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => d.value)
            .attr("x1", l => this.svg.select("#" + l.source).attr("cx"))
            .attr("x2", l => this.svg.select("#" + l.target).attr("cx"))
            .attr("y1", l => this.svg.select("#" + l.source).attr("cy"))
            .attr("y2", l => this.svg.select("#" + l.target).attr("cy"));
    }

    componentWillReceiveProps(props) {
        // Hijack prop updates
        const nodeData:SerializedMasterController = JSON.parse(props.nodeData);
        if (nodeData.controllers.length === 0) {
            return;
        }
        const serverNodes = nodeData.controllers[0].nodes;
        const serverConnections = nodeData.controllers[0].connections;
        const nodes = serverNodes.map((node):Node => {
            return {
                id: node.guid,
                group: 1,
                cx: node.position.x + Math.random() * 10,
                cy: node.position.y,
            };
        });
        const links = serverConnections.map((conn, idx):Link => {
            return {
                source: conn.sourceNode,
                target: conn.destinationNode,
                value: conn.strength,
            };
        });
        this.update({
            nodes,
            links,
        });
    }
    shouldComponentUpdate() {
        // Only call render once
        return false;
    }

    render() {
        return (
            <div className="svg-container">
                <svg width="1500" height="1000" ref={elem => (this.svg = D3.select(elem))}>
                </svg>
            </div>
        );
    }

    drawCircle(args: {
        cx:number,
        cy:number,
        fill:string,
        key:string,
        level:number,
    }) {
        let selection = D3.select("#" + args.key);
        if (selection.empty()) {
            selection = this.svg.append("circle")
                .attr("id", args.key);
        }
        selection
            .attr("cx", args.cx)
            .attr("cy", args.cy)
            .attr("r", RADIUS)
            .attr("fill", args.fill);
    }
};

export default NodeVisualizer;