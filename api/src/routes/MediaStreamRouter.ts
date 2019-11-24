import { logger } from '@shared';
import { Request, Response, Router, Express } from 'express';
import MediaStreamManager from "../inputOutput/MediaStreamManager";

// Init shared
const router = Router();
const streamManager = new MediaStreamManager();

// Form data multer example
// import Multer from "multer";
// import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
// const upload = multer();
// router.post('/addaudio', upload.single("audio"), (req:Request, res:Response) => {
//     if (replyFunc) {
//         replyFunc.send(req.file.buffer);
//     }
//     res.status(OK);
// });

router.ws("/streamaudio", (ws, req) => {
    console.log("steamaudio open request:", req.body);
    ws.on("message", (msg) => {
        // @ts-ignore
        // console.log(new Int8Array(msg)); // For debugging - matches the client
        ws.send(msg);
    });
});

export default router;
