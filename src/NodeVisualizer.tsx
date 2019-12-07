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
        setInterval(() => {
            this.update();
        }, 1000);
    }

    update() {
        this.drawCircle({
            cx: 50,
            cy: Math.random() < 0.5 ? 50 : 150,
            fill: "red",
            key: "c1",
            level: 0.5,
        });
        this.drawCircle({
            cx: 150,
            cy: 50,
            fill: "red",
            key: "c2",
            level: 0.5,
        });
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