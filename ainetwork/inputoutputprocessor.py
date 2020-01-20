import json
import redis
import time
import multiprocessing
import neuron

redisCli = redis.Redis(host="localhost", decode_responses=True)
redisPubsub = redisCli.pubsub()
redisPipeline = redisCli.pipeline()

inputQueues = [
    "ChatroomInput",
]
outputQueues = [
    "ChatroomOutput"
]

MAX_LEN = 50
def chatroomReceive(msg):
    print("Chatroom receive:", msg)
    parsed = json.loads(msg)
    redisCli.publish(outputQueues[0], "GOT" + parsed["chatText"])
    text = parsed["chatText"]
    encoded = text.encode("ascii")
    for i in range(0, MAX_LEN):
        if i < len(encoded):
            redisPipeline.set("{0}".format(i), encoded[i])
        else:
            redisPipeline.set("{0}".format(i), 0)
    redisPipeline.execute()


for queue in inputQueues:
    redisPubsub.subscribe(queue)

for i in range(0, 1):
    p = multiprocessing.Process(target=neuron.runNeuron)
    p.start()

while True:
    msg = redisPubsub.get_message()
    if msg:
        if msg["type"] == "message":
            if msg["channel"] == inputQueues[0]:
                chatroomReceive(msg["data"])
    time.sleep(0.01)


