import React from 'react';

class Audio extends React.Component {
    // @ts-ignore
    private d_mediaRecorder:MediaRecorder|undefined;
    private d_websocket:WebSocket;
    public state:{
        downloadLink?:any,
        isRecording:boolean,
        volume:number,
    };
    constructor(props) {
        super(props);
        this.state = {
            isRecording:false,
            volume: 0,
        };
        this.d_websocket = new WebSocket("ws://localhost:9000/api/mediastream/streamaudio");
        this.setupWebsocket();
    }

    componentDidMount() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
        })
        .then(stream => {
            // @ts-ignore
            this.d_mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });
            this.setupAudioIfReady();
        })
        .catch(error => {
            console.error("Could not get audio device:", error);
        });
    }

    render() {
        return (
            <div>
                <h2>
                    Audio Listener Volume {this.state.volume}
                </h2>
                <button onClick={this.handleRecordClick.bind(this)}>
                    { this.state.isRecording ? "Stop" : "Record" }
                </button>
                <a href={this.state.downloadLink ? this.state.downloadLink : ""}
                   download="acetest.wav">
                    Download {/* Have to play in Windows Media Player */}
                </a>
            </div>
        );
    }

    private async setupWebsocket() {
        this.d_websocket.onopen = (evt) => {
            console.log("Open websocket sending request to open server side");
            // Required for server to receive / open
            //this.d_websocket.send("Open websocket");
            this.setupAudioIfReady();
        };
        this.d_websocket.onmessage = (message) => {
            this.processData(message.data);
        };
    }

    private async processData(data) {
        const buffer = await data.arrayBuffer();
        console.log("Response buffer:", buffer);
    };

    private async sendRecorderData(data:Blob) {
        // @ts-ignore
        const buffer:ArrayBuffer = await data.arrayBuffer();
        console.log("Send buffer:", buffer); // For debugging - matches the server
        this.d_websocket.send(buffer);
        // Form data example
        // const fd = new FormData();
        // fd.append("audio", data, "myfile");
        // const response = await fetch("http://localhost:9000/api/mediastream/addaudio", {
        //     method: "POST",
        //     body: fd,
        // });
    }

    private setupAudioIfReady() {
        if (this.d_websocket.readyState !== 1 || !this.d_mediaRecorder) {
            return;
        }

        console.log("Setting up audio");
        let curChunks:Array<any> = [];
        this.d_mediaRecorder.addEventListener("dataavailable", (evt) => {
            if (evt.data.size > 0) {
                curChunks.push(evt.data);
                this.sendRecorderData(evt.data);
            }
        });
        this.d_mediaRecorder.addEventListener("stop", () => {
            const href = URL.createObjectURL(new Blob(curChunks));
            this.setState({
                downloadLink: href,
            });
            curChunks = [];
        });
    }

    private handleRecordClick() {
        if (this.state.isRecording) {
            this.d_mediaRecorder.stop();
        }
        else {
            // Fire every 100ms
            this.d_mediaRecorder.start(1000);
        }
        this.setState({
            isRecording: !this.state.isRecording,
        });
    }


}

export default Audio;