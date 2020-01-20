import json
import redis
import time

def runNeuron():
    print("IS RUNNING")
    redisCli = redis.Redis(host="localhost", decode_responses=True)
    redisPipeline = redisCli.pipeline()
    inputKeys = []
    for i in range(0, 5):
        inputKeys.append("{0}".format(i))

    while True:
        for inputKey in inputKeys:
            redisPipeline.get(inputKey)
        inputs = redisPipeline.execute()
        print("INPUTS:", inputs)
        for inputKey in inputKeys:
            redisPipeline.set(inputKey, 0)
        redisPipeline.execute()
        time.sleep(0.5)