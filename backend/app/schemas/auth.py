from typing import List, Optional
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    email: str = Field(..., description="User email or username")
    password: str = Field(..., description="User password")

class UserInfo(BaseModel):
    id: str
    email: str
    name: str
    role: str
    token: str
    permissions: List[str] = []

class LoginResponse(BaseModel):
    success: bool = True
    message: str = "Authentication successful"
    user: UserInfo
