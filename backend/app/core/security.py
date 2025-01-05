
from passlib.context import CryptContext
from datetime import timedelta, datetime
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Optional

# Configuration constants
SECRET_KEY = "smart-library"  # Replace with a secure, environment variable-managed secret in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for extracting token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def hash_password(password: str) -> str:
    """
    Hashes a plain text password using bcrypt.
    
    Args:
        password (str): The plain text password.
    
    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain text password against a hashed password.
    
    Args:
        plain_password (str): The plain text password.
        hashed_password (str): The hashed password to compare against.
    
    Returns:
        bool: True if the passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a JWT access token with optional expiration.
    
    Args:
        data (dict): The payload data to encode in the token.
        expires_delta (Optional[timedelta]): The token's expiry duration. Defaults to 30 minutes if not provided.
    
    Returns:
        str: The encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Decodes and validates the JWT token to retrieve the user's information.
    Args:
        token (str): The JWT token extracted from the request header.
    
    Raises:
        HTTPException: If the token is invalid or expired.
    
    Returns:
        dict: A dictionary containing the user's `sub` (username) and `role`.
    """
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        role: Optional[str] = payload.get("role")
        
        if not username or not role:
            raise credentials_exception
        
        return {"sub": username, "role": role}
    except JWTError as e:
        raise credentials_exception from e