from pydantic import BaseModel
from typing import Optional
from app.schemas.user import UserResponse

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AppConfigResponse(BaseModel):
    project_name: str
    relationship_start_date: str
