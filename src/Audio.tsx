import React from 'react';
import { thisExpression } from '@babel/types';


class Audio extends React.Component {
    public state:{
        isPlaying:boolean,
        isRecording:boolean,
        volume:number,
    };
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false,
            isRecording: false,
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

    private handleRecordClick() {

    }

    private handlePlayClick() {

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
                <button onClick={this.handlePlayClick.bind(this)}>
                    { this.state.isPlaying ? "Stop" : "Play" }
                </button>
            </div>

        )
    }
}


export default Audio;
