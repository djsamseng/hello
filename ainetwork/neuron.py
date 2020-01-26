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
    neuronId = str(STATE["_id"])
    for i in range(0, len(STATE["state"])):
        key = "{0}i{1}".format(neuronId, i)
        redisPipeline.lpop(key)

    recv = np.array(redisPipeline.execute())
    log("Receive:{0}".format(recv))
    recv[recv == None] = 0
    # String to int
    recv = recv.astype(int, copy=False)

    # Update state
    state = np.array(STATE["state"], dtype=int)
    changeFactor = np.average(np.abs(STATE["weights"]), axis=1)
    change = recv - state
    state = state + change * changeFactor
    state = state.astype(int)
    STATE["state"] = state
    log("NewState:{0}".format(state))
    for i in range(len(state)):
        redisPipeline.set("{0}s{1}".format(neuronId, i), int(state[i]))

    # Calculate output
    outArr = np.dot(recv, STATE["weights"])
    # Float to int - send a lot less data to redis
    outArr = outArr.astype(int, copy=False)
    # Update output
    for i in range(len(STATE["outputs"])):
        outputNeuron = STATE["outputs"][i]
        outputKey = outputNeuron["nodeId"] + outputNeuron["key"]
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