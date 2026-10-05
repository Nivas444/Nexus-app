from fastapi import APIRouter, Depends, Header, HTTPException, status
from typing import Optional
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse, summary="Authenticate user with email and password")
def login(payload: LoginRequest) -> LoginResponse:
    """
    Authenticate user. Supports Admin (admin@nexus.com / admin123)
    and Commercial Manager (commercial@nexus.com / commercial123).
    """
    return auth_service.authenticate_user(payload)

@router.get("/me", response_model=UserInfo, summary="Get current user info from token")
def get_current_user(authorization: Optional[str] = Header(None)) -> UserInfo:
    """
    Retrieve authenticated user details from Authorization header.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    token = authorization.replace("Bearer ", "").strip()
    user = auth_service.get_user_by_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token"
        )
    return user
