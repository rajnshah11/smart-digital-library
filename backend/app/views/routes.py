from fastapi import APIRouter, Depends
from app.controllers.auth_controller import register_user, login_user, check_role
from app.models.user import UserIn
from app.core.security import get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register")
async def register(user: UserIn):
    return await register_user(user)

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return await login_user(form_data.username, form_data.password)


@router.get("/admin")
async def admin_route(current_user: dict = Depends(get_current_user)):
    await check_role(current_user, required_role="admin")
    return {"msg": "Welcome Admin!"}

@router.get("/user")
async def user_route(current_user: dict = Depends(get_current_user)):
    await check_role(current_user, required_role="user")
    return {"msg": f"Welcome {current_user['sub']}!"}