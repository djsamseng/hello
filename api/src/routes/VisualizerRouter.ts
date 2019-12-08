import { logger } from '@shared';
import { Request, Response, Router, Express } from 'express';
import NodeController from "../ai/NodeController";

// Init shared
const router = Router();

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

router.ws("/subscribe", (ws, req) => {
    console.log("visualizer subscribe open request:", req.body);
    NodeController.initControllers();
    setInterval(() => {
        const data = NodeController.serialize();
        if (ws.readyState === 1) {
            ws.send(JSON.stringify(data));
        }
    }, 2000);
    ws.on("message", (msg) => {
        // @ts-ignore
        // console.log(new Int8Array(msg)); // For debugging - matches the client
        // ws.send(msg);
    });
});

export default router;
