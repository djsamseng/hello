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
    "RestartNetwork",
    "StopNetwork"
]
outputQueues = [
    "ChatroomOutput"
]

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
    redisCli.publish(outputQueues[0], text)

    encoded = [t for t in text.encode("ascii")]
    print("Chatroom sending to 0:{0}".format(encoded))
    redisPipeline.rpush("0i0", *encoded)
    redisPipeline.execute()

for queue in inputQueues:
    redisPubsub.subscribe(queue)

pool = []
def start():
    global pool
    if len(pool) != 0:
        return

    for i in range(0, 2):
        p = multiprocessing.Process(target=neuron.runNeuron, args=(i,))
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
