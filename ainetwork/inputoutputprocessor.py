import json
import redis
import time

redisCli = redis.Redis(host="localhost", decode_responses=True)
redisPubsub = redisCli.pubsub()

inputQueues = [
    "ChatroomInput",
]
outputQueues = [
    "ChatroomOutput"
]

def chatroomReceive(msg):
    print("Chatroom receive:", msg)
    parsed = json.loads(msg)
    redisCli.publish(outputQueues[0], "GOT" + parsed["chatText"])

for queue in inputQueues:
    redisPubsub.subscribe(queue)

while True:
    msg = redisPubsub.get_message()
    if msg:
        if msg["type"] == "message":
            if msg["channel"] == inputQueues[0]:
                chatroomReceive(msg["data"])
    time.sleep(0.01)


