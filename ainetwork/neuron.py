import json
import numpy as np
import redis
import time

STATE = {}

def initNode(nodeId):
    STATE["nodeId"] = nodeId
    redisCli = redis.Redis(host="localhost", decode_responses=True)
    redisPipeline = redisCli.pipeline()
    STATE["redisPipeline"] = redisPipeline

    if nodeId == 0:
        # Fixme nodeId != inputs or output keys
        STATE["inputKeys"] = [nodeId]
        STATE["outputKeys"] = [nodeId + 1]
        # Receive 1 node, send to 4 nodes
        STATE["weights"] = np.array([
            [ 0.5, 0.5, 0.5, 0.5, ]
        ])
    else:
        STATE["inputKeys"] = [nodeId]
        STATE["outputKeys"] = []
        # Receive 3 nodes, send to 4 nodes
        STATE["weights"] = np.array([
            [ 0.5, 0.5, 0.5, 0.5, ],
            [ 0.5, 0.5, 0.5, 0.5, ],
            [ 0.5, 0.5, 0.5, 0.5, ],
        ])



def log(message):
    print("Node:{0} {1}".format(STATE["nodeId"], message))

def tick():
    redisPipeline = STATE["redisPipeline"]
    for inputKey in STATE["inputKeys"]:
        redisPipeline.lpop(inputKey)

    recv = np.array(redisPipeline.execute())
    log("Receive:{0}".format(recv))
    recv[recv == None] = 0
    # String to int
    recv = recv.astype(int, copy=False)
    recv = np.resize(recv, np.shape(STATE["weights"])[0])
    outArr = np.dot(recv, STATE["weights"])
    # Float to int - send a lot less data to redis
    outArr = outArr.astype(int, copy=False)
    for i in range(len(STATE["outputKeys"])):
        outputKey = STATE["outputKeys"][i]
        redisPipeline.rpush(outputKey, int(outArr[i]))
        log("To:{0} Send:{1}".format(outputKey, outArr[i]))
    redisPipeline.execute()

def runNeuron(nodeId):
    initNode(nodeId)
    log("Running")

    while True:
        tick()
        time.sleep(0.5)