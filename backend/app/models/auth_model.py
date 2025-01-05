from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserIn(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="The unique username for the user")
    password: str = Field(..., min_length=8, description="The user's password")
    email: EmailStr = Field(None, description="The user's email address")
    role: str = Field("user", description="The role assigned to the user")

class UserInDB(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="The unique username for the user")
    hashed_password: str = Field(..., min_length=8, description="The hashed password of the user")
    email: EmailStr = Field(None, description="The user's email address")
    role: str = Field("user", description="The role assigned to the user")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="The datetime when the user was created")
    is_active: bool = Field(True, description="Indicates whether the user is active")

class UserOut(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="The unique username for the user")
    email: EmailStr = Field(None, description="The user's email address")
    role: str = Field("user", description="The role assigned to the user")
    created_at: datetime = Field(..., description="The datetime when the user was created")
    is_active: bool = Field(..., description="Indicates whether the user is active")

# Define the Token model
class Token(BaseModel):
    access_token: str
    token_type: str
    role:str