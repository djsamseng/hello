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
    STATE["weights"] = np.array(STATE["weights"])
    STATE["state"] = np.array(STATE["state"], dtype=int)
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
    for i in range(0, len(STATE["outputs"])):
        outputNeuron = STATE["outputs"][i]
        key = "{0}s{1}".format(outputNeuron["nodeId"], outputNeuron["key"])
        redisPipeline.get(key)

    resp = np.array(redisPipeline.execute())
    resp[resp == None] = 0
    # String to int
    resp = resp.astype(int, copy=False)
    recv = resp[0:len(STATE["state"])]
    outputNeuronState = resp[len(STATE["state"]) : len(STATE["state"]) + len(STATE["outputs"])]
    log("Receive:{0}".format(outputNeuronState))

    # Update state
    state = STATE["state"]
    weights = STATE["weights"]
    changeFactor = np.average(np.abs(weights), axis=1)
    change = recv - state
    state = state + change * changeFactor
    state = state.astype(int)
    STATE["state"] = state
    log("NewState:{0}".format(state))
    for i in range(len(state)):
        redisPipeline.set("{0}s{1}".format(neuronId, i), int(state[i]))

    # Calculate output
    outArr = np.dot(state, weights)
    # Float to int - send a lot less data to redis
    outArr = outArr.astype(int, copy=False)
    # Update output
    for i in range(len(STATE["outputs"])):
        outputNeuron = STATE["outputs"][i]
        outputKey = "{0}i{1}".format(outputNeuron["nodeId"], outputNeuron["key"])
        redisPipeline.rpush(outputKey, int(outArr[i]))
        log("To:{0} Send:{1}".format(outputKey, outArr[i]))

    redisPipeline.execute()

    # Update weights
    # Making a big difference?
    sendDiffReact = (outputNeuronState - outArr)/127
    weights = weights + sendDiffReact * 0.1
    # Weights go down for anyone who doesn't care about my outputs
    # Weights go up if I'm not providing enough to keep them up
    print(weights)
    STATE["weights"] = weights

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