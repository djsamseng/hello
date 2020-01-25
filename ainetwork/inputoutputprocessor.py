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
# Take one character at a time. Feed it into the network, wait for the network
# to process it (ack it) then send the next. Essentially this can act as a single node
# with a single input (or multiple nodes each with a single input)
# Node to node can be a queue, if a queue is too long, increase the number of receving nodes
# Instead of queue we could use an array LLEN where it pops off
def chatroomReceive(msg):
    print("Chatroom receive:", msg)
    parsed = json.loads(msg)
    redisCli.publish(outputQueues[0], "GOT" + parsed["chatText"])
    text = parsed["chatText"]
    encoded = [t for t in text.encode("ascii")]
    print("Chatroom sending to 0:{0}".format(encoded))
    redisPipeline.rpush(0, *encoded)
    redisPipeline.execute()

for queue in inputQueues:
    redisPubsub.subscribe(queue)

for i in range(0, 2):
    p = multiprocessing.Process(target=neuron.runNeuron, args=(i,))
    p.start()

while True:
    msg = redisPubsub.get_message()
    if msg:
        if msg["type"] == "message":
            if msg["channel"] == inputQueues[0]:
                chatroomReceive(msg["data"])
    time.sleep(0.01)


