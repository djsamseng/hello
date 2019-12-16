import React from 'react';
import NodeVisualizer from "./NodeVisualizer";

type State = {
    isVisualizing:boolean
    nodeData:string
};
class Visualizer extends React.Component<{},State> {
    private d_websocket:WebSocket;
    public state:State;
    constructor(props) {
        super(props);
        this.state = {
            isVisualizing: false,
            nodeData: "",
        };
        this.d_websocket = new WebSocket("ws://localhost:9000/api/visualizer/subscribe");
        this.setupWebsocket();
    }

    render() {
        return (
            <div>
                <h2>
                    Visualizer
                </h2>
                <NodeVisualizer nodeData={this.state.nodeData} />
                <br />
                <button onClick={this.handleVisualizeClick.bind(this)}>
                    { this.state.isVisualizing ? "Stop Visualization" : "Start Visualization" }
                </button>
            </div>
        );
    }

    private handleVisualizeClick() {
        if (this.state.isVisualizing) {

        }
        else {

        }

        this.setState({
            isVisualizing: !this.state.isVisualizing,
        });
    }

    private async test() {
        try {
            const resp = await fetch("http://localhost:9000/api/webnavigation/test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "test",
                }),
            });
            const json = await resp.json();
            console.log("Got test response:", json);
        }
        catch (error) {
            console.error("Webnavigation test failed:", error);
        }
    }

    private async setupWebsocket() {
        this.d_websocket.onopen = (evt) => {
            console.log("Open websocket sending request to open server side");
            // Required for server to receive / open
            this.test();
            this.d_websocket.send("Open websocket");
        };
        this.d_websocket.onmessage = (message) => {
            this.setState({
                nodeData: message.data,
            });
        };
    }
}

export default Visualizer;