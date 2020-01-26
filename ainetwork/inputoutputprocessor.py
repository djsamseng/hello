import json
import redis
import time
import multiprocessing
import neuron as Neuron
import pymongo
from bson.objectid import ObjectId as MongoObjectId

redisCli = redis.Redis(host="localhost", decode_responses=True)
redisPubsub = redisCli.pubsub()
redisPipeline = redisCli.pipeline()

mongoClient = pymongo.MongoClient('localhost', 27017)
db = mongoClient.helloNetworkDb
inputNeuronsCol = db.inputNeurons
chatroomInputNeurons = []
if inputNeuronsCol.count_documents({}) > 0:
    cursor = inputNeuronsCol.find({
        "inputType": "ChatroomInput"
    })
    for inputNeuron in cursor:
        chatroomInputNeurons.append(str(inputNeuron["neuronId"]))

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
        redisPipeline.rpush("{0}i0".format(inputNeuronId), *encoded)
    redisPipeline.execute()

for queue in inputQueues:
    redisPubsub.subscribe(queue)

def start():
    global pool
    global chatroomInputNeurons
    if len(pool) != 0:
        return

    neuronsCollection = db.neurons
    if neuronsCollection.count_documents({}) == 0:
        newNodes = [{
            "inputKeys": ["i0"],
            "outputKeys": [],
            "weights": [
                [0.5, 0.5, 0.5, 0.5]
            ]
        }, {
            "inputKeys": ["i0","i1","i2",],
            "outputKeys": [],
            "weights": [
                [0.5, 0.5, 0.5, 0.5],
                [0.5, 0.5, 0.5, 0.5],
                [0.5, 0.5, 0.5, 0.5]
            ]
        }]
        res = neuronsCollection.insert_many(newNodes)
        newNodes[0]["_id"] = res.inserted_ids[0]
        newNodes[1]["_id"] = res.inserted_ids[1]
        newNodes[0]["inputKeys"] = [
            str(newNodes[0]["_id"]) + "i0"
        ]
        newNodes[0]["outputKeys"] = [
            str(newNodes[1]["_id"]) + "i0",
            str(newNodes[1]["_id"]) + "i2",
        ]
        newNodes[1]["inputKeys"] = [
            str(newNodes[1]["_id"]) + "i0",
            str(newNodes[1]["_id"]) + "i1",
            str(newNodes[1]["_id"]) + "i2",
        ]
        for newNode in newNodes:
            neuronsCollection.find_one_and_replace(
                { "_id": newNode["_id"] },
                newNode
            )
        inputNeuronsCol.insert_one({
            "inputType": "ChatroomInput",
            "neuronId": str(newNodes[0]["_id"])
        })
        chatroomInputNeurons = [
            str(newNodes[0]["_id"])
        ]


    for neuron in neuronsCollection.find():
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
