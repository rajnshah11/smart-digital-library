from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user
from app.controllers.auth_controller import check_role
from app.controllers.logs_controller import get_dashboard_data, get_logs
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.get("/dashboard")
async def dashboard(current_user: dict = Depends(get_current_user)):
    """Dashboard endpoint to generate data."""
    await check_role(current_user, required_role="admin")
    data = get_dashboard_data()
    return jsonable_encoder(data)

@router.get("/logs")
async def logs(
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("timestamp"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
):
    """Logs endpoint with pagination and sorting."""
    await check_role(current_user, required_role="admin")
    data = get_logs(page, page_size, sort_by, sort_order)
    return jsonable_encoder(data)
