import boto3
import json, uuid
import asyncio
from aiokafka import AIOKafkaConsumer
from aiokafka.admin import AIOKafkaAdminClient, NewTopic
from botocore.exceptions import ClientError
from datetime import datetime

LOGS_TABLE_NAME = "logs"
dynamodb_client = boto3.resource('dynamodb')
logs_table = dynamodb_client.Table(LOGS_TABLE_NAME)

async def ensure_topic_exists(topic_name: str, bootstrap_servers: str):
    admin_client = AIOKafkaAdminClient(bootstrap_servers=bootstrap_servers)
    await admin_client.start()
    try:
        topics = await admin_client.list_topics()
        if topic_name not in topics:
            print(f"Topic {topic_name} does not exist. Creating it...")
            new_topic = NewTopic(name=topic_name, num_partitions=1, replication_factor=1)
            await admin_client.create_topics([new_topic])
    finally:
        await admin_client.close()

class LogConsumer:
    def __init__(self, bootstrap_servers: str, topic: str):
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic

    async def consume_logs(self):
        consumer = AIOKafkaConsumer(
            self.topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id="log_consumers",
            auto_offset_reset="earliest",
            session_timeout_ms=30000, 
            request_timeout_ms=30000  
        )
        
        await consumer.start()
        try:
            async for message in consumer:
                try:
                    log_data = json.loads(message.value.decode('utf-8'))
                    await self.store_log(log_data)
                    print(f"Log hi: {log_data}")
                except json.JSONDecodeError as e:
                    print(f"Error decoding message: {str(e)}")
                except Exception as e:
                    print(f"Error processing message: {str(e)}")
        finally:
            await consumer.stop()

    async def store_log(self, log_data):
        try:
            log_data["log_id"] = str(uuid.uuid4()) 
            await self.put_item_to_dynamodb(log_data)
        except Exception as e:
            print(f"Error inserting log into DynamoDB: {str(e)}")

    async def put_item_to_dynamodb(self, log_data):
        try:
            response = logs_table.put_item(Item=log_data)
            print(f"Log successfully inserted: {response}")
        except ClientError as e:
            print(f"Error inserting log into DynamoDB: {e.response['Error']['Message']}")

if __name__ == "__main__":
    async def main():
        bootstrap_servers = "localhost:9092"
        topic = "action_logs"
        await ensure_topic_exists(topic, bootstrap_servers)

        consumer = LogConsumer(bootstrap_servers=bootstrap_servers, topic=topic)
        await consumer.consume_logs()

    asyncio.run(main())
