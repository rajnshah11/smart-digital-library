from fastapi import APIRouter, Depends, HTTPException, status
from app.controllers.auth_controller import register_user, login_user
from app.models.auth_model import UserIn, Token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserIn):
    """
    Endpoint to register a new user.
    """
    try:
        return await register_user(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint for user login.
    """
    try:
        token = await login_user(form_data.username, form_data.password)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token
    except HTTPException as e:
        raise e 
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
