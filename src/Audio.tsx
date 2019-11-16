import React from 'react';
import ReactMediaRecorder from "react-media-recorder";

class Audio extends React.Component {
    private d_mediaRecorder:any;

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
            const audioContext = new window.AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(1024, 1, 1);
            const analyzer = audioContext.createAnalyser();
            source.connect(processor);
            source.connect(analyzer);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = (evt) => {
                this.processChannelData(evt.inputBuffer.getChannelData(0), analyzer);
            };
            // @ts-ignore
            const mediaRecorder = this.d_mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm",
            });

            let curChunks:Array<any> = [];
            mediaRecorder.addEventListener("dataavailable", (evt) => {
                console.log("DATA:", evt.data.size);
                if (evt.data.size > 0) {
                    curChunks.push(evt.data);
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

    private processChannelData(channelData:Float32Array, analyzer:AnalyserNode) {
        const array = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(array);
        this.setState({
            volume: this.avgArray(array),
        });
    }

    private avgArray(arr) {
        return arr.reduce((sum, cur) => {
            return sum + cur;
        }, 0);
    }

    private handleStopRecording(blobUrl) {
        /*this.setState({
            downloadLink: blobUrl,
        });*/
    }

    private handleRecordClick() {
        if (this.state.isRecording) {
            this.d_mediaRecorder.stop();
        }
        else {
            this.d_mediaRecorder.start();
        }
        this.setState({
            isRecording: !this.state.isRecording,
        });
    }

    render() {
        function mediaRecorderRender({status, startRecording, stopRecording, mediaBlob}) {
            return (
                <div>
                    <p>{status}</p>
                    <button onClick={startRecording}>
                        Start Recording
                    </button>
                    <button onClick={stopRecording}>
                        Stop Recording
                    </button>
                    <audio src={mediaBlob} controls />
                </div>
            )
        }
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
                <ReactMediaRecorder
                    audio={true}
                    render={mediaRecorderRender}
                    whenStopped={this.handleStopRecording.bind(this)} />

            </div>
        );
    }
}

export default Audio;