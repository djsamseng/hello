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

// Each matrix multiplication is a product of many producers
// 1) Massive massive matrices
//    - way too large
// 2) Array input x Matrix state => Array output
//    - way too much IPC
// 3) DB stores massive matrix. Consumers grab process and write
//    - no locking or transactions
//    - can be lossy
//    - Not parallizable easily
// 4) Each sub matrix multiplication knows who the write the output to
//    - Each processor knows where each output should go - divides up it's outputs
//    - Sends a map of which cells should be updated
//    - Should we only send changes (diffs)? Yes probably
//    - How to get around synchronization? Each processor needs to tick, we need async queue consumption
//    - If a processor is too slow glua cells will notice and divide slow cells
//    - Message to store state causes each processor to store into database its state and current inputs
//    - Who the processor sends to needs to be able to change
//    - Inner parts of a processor may die - trim down it's matrix size (ie consolidate) during sleep time?
//        - If I don't care about certain input cells then anyone who sends to those input cells can trim down their output
//          by adding a vector at the end of the multiplication by 0 at the end. If the entire subarray to one
//          destination is 0 then that communication channel can be removed.
//        - How can we reduce the size of a matrix? Equivalent smaller matrix?
// 20 billion neurons each with ~10,000 connections
/*
1) Update activity level of neuron
inputs change input layer
[ il1 ]                          [ i1 ]      [ il1' ]
[ il2 ]                          [ i2 ]      [ il2' ]
   .       x 0.8 (retention) +      .     =     .
   .                                .           .
   .                                .           .
 5,000                            5,000       5,000

 Change connections either by
    A) YES - Massive matrix mapping to 5,000 other neurons and change weights
        - Who registers for the outputs may changed
    B) NO - il1 goes to o1 directly if SUM(il) > threshold. Who o1 is changes over time (someone else registers to receive o1)
        - but this is just linear?
        - Need multiple subscribers to o1?

threshold based off of current state = current input layer
if abs(sum(il')) < activation required
    stop - do nothing

[ il1' il2' ... 5,000 ]    [ il1 weight to o1 ] [ il1 weight to o2 ]      [ ol1 ]
                           [ il2 weight to o1 ] [ il2 weight to o2 ]      [ ol2 ]
                                     .                   .                   .
                        x            .                   .          =        .
                                     .                   .                   .
                                    5,000               5,000               5,000

- Each weight updates by the amount of input (il) vs feedback (olf)
When A sends a message to B, B sends an ack saying it's B's il.

[ Ail1 weight to o2 ]     [ Ai1 ]              [ Bil2 ]              [ Ail1 weight to o2 ]
[ Ail2 weight to o2 ]     [ Ai2 ]              [ Bil2 ]              [ Ail2 weight to o2 ]
           .                 .                    .                             .
           .          +      .     x 0.01   -     .    x 0.01   =               .
           .                 .                    .                             .
          5,000            5,000                5,000                          5,000


*/


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
