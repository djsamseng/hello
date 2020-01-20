import pika


outputQueues = [
    ("ChatroomOutput")
]

def chatroomReceive(ch, method, props, body):
    print("Received:{0}", body, flush=True)
    ch.basic_publish(exchange="", routing_key=outputQueues[0], body=body)

# Input and output process
# Knows where to write the data to (who needs to be notified)
# Reads the final data and write back to necessary parts
connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()
inputQueues = [
    ("ChatroomInput", chatroomReceive),
]
for queue in inputQueues:
    channel.queue_declare(queue=queue[0])
    channel.basic_consume(queue=queue[0], auto_ack=True, on_message_callback=queue[1])

for queue in outputQueues:
    channel.queue_declare(queue=queue[0])

# Blocking forever loop
print("Consuming inputQueues:", inputQueues, " outputQueues:", outputQueues)
channel.start_consuming()

