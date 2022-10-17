import json
import redis
import time
import multiprocessing
import neuron as Neuron

redisCli = redis.Redis(host="localhost", decode_responses=True)
redisPubsub = redisCli.pubsub()
redisPipeline = redisCli.pipeline()

chatroomInputNeurons = ["Node0" + "i0"]

inputQueues = [
    "ChatroomInput",
    "RestartNetwork",
    "StopNetwork"
]
outputQueues = [
    "ChatroomOutput"
]

pool = []

# Take one character at a time. Feed it into the network, wait for the network
# to process it (ack it) then send the next. Essentially this can act as a single node
# with a single input (or multiple nodes each with a single input)
# Node to node can be a queue, if a queue is too long, increase the number of receving nodes
# Instead of queue we could use an array LLEN where it pops off
def chatroomReceive(msg):
    print("Chatroom receive:", msg)
    parsed = json.loads(msg)
    if "chatText" not in parsed:
        return

    # Remove me
    text = parsed["chatText"]
    redisCli.publish(outputQueues[0], text)
    encoded = [t for t in text.encode("ascii")]
    for inputNeuronId in chatroomInputNeurons:
        print("Chatroom sending to {0}:{1}".format(inputNeuronId, encoded))
        redisPipeline.rpush(inputNeuronId, *encoded)
    redisPipeline.execute()

for queue in inputQueues:
    redisPubsub.subscribe(queue)

def start():
    global pool
    global chatroomInputNeurons
    if len(pool) != 0:
        return

    newNodes = [{
        "outputs": [],
        "state": [0,],
        "weights": [
            # One input 3 outputs
            [0.5, 0.5, 0.5,]
        ]
    }, {
        "outputs": [],
        "state": [0, 0, 0],
        "weights": [
            # 3 inputs 2 outputs
            [0.5, 0.5,],
            [0.5, 0.5,],
            [0.5, 0.5,]
        ]
    }]
    newNodes[0]["_id"] = "Node0"
    newNodes[1]["_id"] = "Node1"
    newNodes[0]["outputs"] = [
        {
            "nodeId": str(newNodes[1]["_id"]),
            "key": "0",
        },
        {
            "nodeId": str(newNodes[1]["_id"]),
            "key": "2",
        },
        {
            "nodeId": "None",
            "key": "None"
        },
    ]
    newNodes[1]["outputs"] = [
        {
            "nodeId": "None",
            "key": "None"
        },
        {
            "nodeId": "None",
            "key": "None"
        },
    ]
    chatroomInputNeurons = [
        str(newNodes[0]["_id"]) + "i0"
    ]

    for neuron in newNodes:
        p = multiprocessing.Process(target=Neuron.runNeuron, args=(neuron,))
        p.start()
        pool.append(p)

def stop():
    global pool
    print("Joining nodes")
    for p in pool:
        p.join()
    print("All nodes joined")
    pool = []

start()

while True:
    msg = redisPubsub.get_message()
    if msg:
        if msg["type"] == "message":
            if msg["channel"] == inputQueues[0]:
                chatroomReceive(msg["data"])
            if msg["channel"] == inputQueues[1]:
                stop()
                start()
            if msg["channel"] == inputQueues[2]:
                stop()
    time.sleep(0.01)
