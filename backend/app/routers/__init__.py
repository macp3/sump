from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.dates import router as dates_router
from app.routers.calendar import router as calendar_router
from app.routers.clock import router as clock_router

__all__ = ["auth_router", "users_router", "dates_router", "calendar_router", "clock_router"]
