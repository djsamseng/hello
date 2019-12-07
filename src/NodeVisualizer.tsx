import React from 'react';
import * as D3 from "d3";
const RADIUS = 10;
class NodeVisualizer extends React.Component {
    private svg:any;
    constructor(props) {
        super(props);
        this.svg = null;

    }

    componentDidMount() {
        this.update();
    }

    update() {
        const N = 100;
        const data = {
            nodes: Array.apply(null, Array(N)).map((_, index) => {
                return {
                    id: "c" + index,
                    group: index % 10,
                    cx: Math.floor(Math.random() * 500),
                    cy: Math.floor(Math.random() * 500),
                }
            }),
            links: Array.apply(null, Array(N)).map((_, index) => {
                return {
                    source: "c" + Math.floor(Math.random() * N),
                    target: "c" + Math.floor(Math.random() * N),
                    value: Math.floor(Math.random() * 5),
                };
            }),
        };

        const nodes = data.nodes.map(d => Object.create(d));
        const node = this.svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 25)
            .attr("fill", "red")
            .attr("cx", d => d.cx)
            .attr("cy", d => d.cy)
            .attr("id", d => d.id);

        const links = data.links.map(d => Object.create(d));
        const link = this.svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
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
        this.update();
    }
    shouldComponentUpdate() {
        // Only call render once
        return false;
    }

    render() {
        return (
            <svg width="500" height="500" ref={elem => (this.svg = D3.select(elem))}>
            </svg>
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