from pydantic import BaseModel
from typing import Optional

class UserIn(BaseModel):
    username: str
    password: str
    role: Optional[str] = "user"

class UserOut(BaseModel):
    username: str
    role: str

class UserInDB(BaseModel):
    username: str
    hashed_password: str
    role: Optional[str] = "user"

