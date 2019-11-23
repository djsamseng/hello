import { logger } from '@shared';

// Init shared

const MIME_TYPE = "audio/webm";

class MediaStreamListener {
    private d_stream:MediaStream;
    private d_recorder:any;
    constructor(args:{
        stream:MediaStream,
    }) {
        this.d_stream = args.stream;
        // @ts-ignore
        this.d_recorder = new MediaRecorder(args.stream, {
            mimeType: "audio/webm",
        });
    }
}

class MediaStreamManager {
    private d_streamMap:Map<string,MediaStreamListener>;
    constructor() {
        this.d_streamMap = new Map<string,MediaStreamListener>();
    }

    public addStream(args:{
        key:string,
        mediaStream:MediaStream,
    }) {
        const listener = new MediaStreamListener({
            stream: args.mediaStream,
        });
        this.d_streamMap.set(args.key, listener);
    }
};

export default MediaStreamManager;