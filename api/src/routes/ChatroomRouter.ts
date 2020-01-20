import { logger } from '@shared';
import { Request, Response, Router, Express } from 'express';
import { spawn } from "child_process";
const Amqp = require("amqplib/callback_api");

// Init shared
const router = Router();

// Instead large distributed GPU matrix multiplications
// Write to cache/db/queue of inputs
// Some program is always running ainetwork of matrix multiplications and writing to output queue
// We pick up outputs and display

const SEND_QUEUE = "ChatroomInput";
let CHATROOM_CHANNEL;
Amqp.connect("amqp://localhost", (err1, conn) => {
    if (err1) {
        throw err1;
    }
    conn.createChannel((err2, channel) => {
        if (err2) {
            throw err2;
        }
        channel.assertQueue(SEND_QUEUE, {
            durable: false
        });
        console.log("Created queue:", SEND_QUEUE);
        CHATROOM_CHANNEL = channel;
    });
});

const RECEIVE_QUEUE = "ChatroomOutput"
Amqp.connect("amqp://localhost", (err1, conn) => {
    if (err1) {
        throw err1;
    }
    conn.createChannel((err2, channel) => {
        if (err2) {
            throw err2;
        }
        channel.assertQueue(RECEIVE_QUEUE, {
            durable: false
        });
        channel.consume(RECEIVE_QUEUE, (msg) => {
            console.log("CONSUME:", msg.content.toString());
        }, {
            noAck: true,
        })
    });
});

function sendMessage(msg) {
    if (CHATROOM_CHANNEL) {
        CHATROOM_CHANNEL.sendToQueue(SEND_QUEUE, Buffer.from(msg));
    }
    else {
        console.warn("No chatroom rabbitmq channel");
    }
}

router.ws("/subscribe", (ws, req) => {
    console.log("GOT REQUEST:", req.body);
    ws.on("message", (msg) => {
        sendMessage(JSON.stringify({result: "Success", msg}));
        ws.send(JSON.stringify({result: "Success", msg}));
    });
});

export default router;

// Download https://www.open-mpi.org/software/ompi/v4.0/
// Build and install https://www.open-mpi.org/faq/?category=building#easy-build
// pip install mpi4py
// const network = spawn("mpirun", ["-n", "5", "python3", "../ainetwork/driver.py"]);
// network.stdout.on("data", data => {
//     console.log("GOT FROM NETWORK:", data.toString());
// });
// network.stderr.on("data", data => {
//     console.log("Got error:", data.toString());
// })
// network.on("exit", code => {
//     console.log("AI ended rc:", code);
// });
//
// setTimeout(() => {
//     network.stdin.write("start\n");
// }, 1000)
//
// setTimeout(() => {
//     network.stdin.write("exit\n");
// }, 5000);
