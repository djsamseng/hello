import { logger } from '@shared';
import { Request, Response, Router, Express } from 'express';
import { spawn } from "child_process";

// Init shared
const router = Router();

const network = spawn("mpirun", ["-n", "5", "python3", "../ainetwork/driver.py"]);
network.stdout.on("data", data => {
    console.log("GOT FROM NETWORK:", data.toString());
});
network.stderr.on("data", data => {
    console.log("Got error:", data.toString());
})
network.on("exit", code => {
    console.log("AI ended rc:", code);
});

setTimeout(() => {
    network.stdin.write("start\n");
}, 1000)

setTimeout(() => {
    network.stdin.write("exit\n");
}, 5000);

router.ws("/subscribe", (ws, req) => {
    console.log("GOT REQUEST:", req.body);
    ws.on("message", (msg) => {
        ws.send(JSON.stringify({result: "Success", msg}));
    });
});

export default router;
