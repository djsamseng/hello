import React from 'react';

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
                console.log("DATA:", evt.data.size);
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
        // const buffer:ArrayBuffer = await data.arrayBuffer();
        // console.log(buffer); // For debugging - matches the server
        const fd = new FormData();
        fd.append("audio", data, "myfile");
        const response = await fetch("http://localhost:9000/api/mediastream/addstream", {
            method: "POST",
            body: fd,
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