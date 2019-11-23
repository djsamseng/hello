import React from 'react';
import { randomBytes } from 'crypto';

class Audio extends React.Component {
    private d_mediaRecorder;
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
        this.streamAudio();
    }

    componentDidMount() {
        navigator.mediaDevices.getUserMedia({
            audio: true,
        })
        .then(stream => {
            // @ts-ignore
            const mediaRecorder = this.d_mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });

            let curChunks:Array<any> = [];
            mediaRecorder.addEventListener("dataavailable", (evt) => {
                if (evt.data.size > 0) {
                    curChunks.push(evt.data);
                    this.sendRecorderData(evt.data);
                }
            });
            mediaRecorder.addEventListener("stop", () => {
                const href = URL.createObjectURL(new Blob(curChunks));
                this.setState({
                    downloadLink: href,
                });
                curChunks = [];
            });
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

    private async sendRecorderData(data:Blob) {
        // @ts-ignore
        const buffer:ArrayBuffer = await data.arrayBuffer();
        console.log("Send buffer:", buffer); // For debugging - matches the server
        const fd = new FormData();
        fd.append("audio", data, "myfile");
        const response = await fetch("http://localhost:9000/api/mediastream/addaudio", {
            method: "POST",
            body: fd,
        });
    }

    private streamAudio() {
        const ws = new WebSocket("ws://localhost:9000/api/mediastream/streamaudio");
        ws.onopen = (evt) => {
            console.log("OPENED!");
            // Required for server to receive / open
            ws.send("TEST");
        };
        async function processData(data) {
            const buffer = await data.arrayBuffer();
            console.log("Response buffer:", buffer);
        };
        ws.onmessage = (message) => {
            processData(message.data);
        };
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