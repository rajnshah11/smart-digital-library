from fastapi import HTTPException, status
from app.core.security import create_access_token, hash_password, verify_password
from app.models.auth_model import UserIn, UserInDB, UserOut, Token
import boto3
from datetime import datetime
dynamodb = boto3.resource('dynamodb', region_name='us-east-1') 
table = dynamodb.Table('Users') 

async def register_user(user: UserIn) -> dict:
    """
    Registers a new user by hashing the password and storing the user in DynamoDB.

    Args:
        user (UserIn): The user details.

    Returns:
        dict: A success message.

    Raises:
        HTTPException: If the username already exists or if an error occurs.
    """
    # Check if the user already exists
    response = table.get_item(Key={'username': user.username})
    if 'Item' in response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    hashed_password = hash_password(user.password)
    user_in_db = UserInDB(
        username=user.username,
        hashed_password=hashed_password,
        email=user.email,
        role=user.role,
        created_at=datetime.utcnow(),
        is_active=True
    )

    user_dict = user_in_db.dict()
    user_dict['created_at'] = user_dict['created_at'].isoformat()

    try:
        table.put_item(Item=user_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

    return {"message": "User registered successfully"}


async def login_user(username: str, password: str) -> Token:
    """
    Authenticates a user by verifying the password and generating an access token.

    Args:
        username (str): The user's username.
        password (str): The user's password.

    Returns:
        Token: The access token and role information.

    Raises:
        HTTPException: If the credentials are invalid.
    """
    response = table.get_item(Key={'username': username})
    user = response.get('Item')
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(data={"sub": username, "role": user["role"]})
    print(access_token)
    return Token(access_token=access_token, token_type="bearer", role=user["role"])

async def check_role(token_data: dict, required_role: str) -> None:
    """
    Checks if the user's role matches the required role for access.

    Args:
        token_data (dict): The token payload data.
        required_role (str): The required role.

    Raises:
        HTTPException: If the user's role does not match the required role.
    """
    user_role = token_data.get("role")
    if user_role != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )