import React from 'react';
import * as D3 from "d3";
const RADIUS = 10;
class NodeVisualizer extends React.Component {
    render() {
        const NArr = Array.apply(null, Array(5));
        const circles = NArr.map((_, index) => {
            return this.drawCircle({
                cx: RADIUS + index * RADIUS * 2,
                cy: RADIUS,
                fill: "red",
                level: 0.5,
                key: String(index),
            });
        });
        return (
            <svg width="150" height="150">
                {circles}
            </svg>
        )
    }

    drawCircle(args: {
        cx:number,
        cy:number,
        fill:string,
        key:string,
        level:number,
    }) {
        return (
            <circle
                    key={args.key}
                    cx={String(args.cx)}
                    cy={String(args.cy)}
                    r={String(RADIUS)}
                    fill={args.fill} />
        )
    }
};

export default NodeVisualizer;