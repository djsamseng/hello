import { logger } from '@shared';
import { Request, Response, Router, Express } from 'express';

// Init shared
const router = Router();

router.ws("/subscribe", (ws, req) => {
    console.log("GOT REQUEST:", req.body);
    ws.on("message", (msg) => {
        ws.send(JSON.stringify({result: "Success", msg}));
    });
});

export default router;
