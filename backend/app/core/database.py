import motor.motor_asyncio
from pymongo.errors import PyMongoError
import asyncio

# Replace <db_username> and <db_password> with your actual MongoDB Atlas credentials
MONGO_DETAILS = 'mongodb+srv://<username>:<password>@cluster0.jsbcp.mongodb.net/?retryWrites=true&w=majority'

# MongoDB client and database variable
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = client["learning_library"]

