from fastapi import HTTPException, status
from app.core.security import create_access_token, hash_password, verify_password
from app.core.database import db
from app.models.user import UserIn, UserInDB

async def register_user(user: UserIn):
    existing_user = await db["users"].find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)
    user_in_db = UserInDB(username=user.username, hashed_password=hashed_password, role=user.role)
    await db["users"].insert_one(user_in_db.dict())
    return {"msg": "User registered successfully"}

async def login_user(username: str, password: str):
    user = await db["users"].find_one({"username": username})
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": username, "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}


async def check_role(token_data: dict, required_role: str):
    if token_data.get("role") != required_role:
        raise HTTPException(status_code=403, detail="Access forbidden")