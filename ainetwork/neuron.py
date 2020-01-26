import json
import numpy as np
import redis
import time

STATE = {}
redisCli = redis.Redis(host="localhost", decode_responses=True)
INPUT_QUEUES = [
    "StopNetwork"
]

def initNode(nodeState):
    global STATE
    STATE = nodeState
    STATE["redisPipeline"] = redisCli.pipeline()
    redisPubsub = redisCli.pubsub()
    for inputKey in INPUT_QUEUES:
        redisPubsub.subscribe(inputKey)
    STATE["redisPubsub"] = redisPubsub

def log(message):
    print("Node:{0} {1}".format(STATE["_id"], message))

def tick():
    redisPipeline = STATE["redisPipeline"]
    for inputKey in STATE["inputKeys"]:
        redisPipeline.lpop(inputKey)

    recv = np.array(redisPipeline.execute())
    log("Receive:{0}".format(recv))
    recv[recv == None] = 0
    # String to int
    recv = recv.astype(int, copy=False)
    # recv = np.resize(recv, np.shape(STATE["weights"])[0])
    outArr = np.dot(recv, STATE["weights"])
    # Float to int - send a lot less data to redis
    outArr = outArr.astype(int, copy=False)
    for i in range(len(STATE["outputKeys"])):
        outputKey = STATE["outputKeys"][i]
        redisPipeline.rpush(outputKey, int(outArr[i]))
        log("To:{0} Send:{1}".format(outputKey, outArr[i]))
    redisPipeline.execute()

def runNeuron(nodeState):
    initNode(nodeState)
    log("Running")

    while True:
        tick()
        msg = STATE["redisPubsub"].get_message()
        if msg and msg["type"] == "message":
            if msg["channel"] == INPUT_QUEUES[0]:
                break
        time.sleep(0.5)