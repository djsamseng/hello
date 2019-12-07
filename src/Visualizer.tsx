import React from 'react';
import NodeVisualizer from "./NodeVisualizer";

class Visualizer extends React.Component {
    private d_websocket:WebSocket;
    public state:{
        isVisualizing:boolean
    };
    constructor(props) {
        super(props);
        this.state = {
            isVisualizing:false,
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
                <NodeVisualizer />
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

    private async setupWebsocket() {
        this.d_websocket.onopen = (evt) => {
            console.log("Open websocket sending request to open server side");
            // Required for server to receive / open
            this.d_websocket.send("Open websocket");
        };
        this.d_websocket.onmessage = (message) => {
            console.log("Received message:", message.data);
        };
    }
}

export default Visualizer;