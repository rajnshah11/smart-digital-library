from aiokafka import AIOKafkaProducer
import asyncio
import json

class KafkaLogger:
    def __init__(self, bootstrap_servers: str, topic: str):
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.producer = None

    async def start(self):
        self.producer = AIOKafkaProducer(bootstrap_servers=self.bootstrap_servers)
        await self.producer.start()

    async def stop(self):
        if self.producer:
            await self.producer.stop()

    async def log_action(self, action: dict):
        if not self.producer:
            raise RuntimeError("Kafka producer is not initialized. Call `start()` first.")
        
        message = json.dumps(action).encode('utf-8')
        await self.producer.send_and_wait(self.topic, message)

kafka_logger = KafkaLogger(bootstrap_servers="localhost:9092", topic="action_logs")
