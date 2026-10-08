import hashlib
import secrets
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo

# Standard user records with roles and credentials
USERS_DATABASE: Dict[str, Dict[str, Any]] = {
    "admin@nexus.com": {
        "id": "usr-admin-01",
        "email": "admin@nexus.com",
        "username": "admin",
        "name": "Admin User",
        "password": "admin123",
        "role": "Admin",
        "permissions": ["all", "master", "projects", "accounts", "admin", "worklist", "purchase", "inventory", "profile"]
    },
    "commercial@nexus.com": {
        "id": "usr-comm-02",
        "email": "commercial@nexus.com",
        "username": "commercial",
        "name": "Commercial Manager",
        "password": "commercial123",
        "role": "Commercial Manager",
        "permissions": ["master", "projects", "worklist", "profile"]
    },
    "project@nexus.com": {
        "id": "usr-proj-03",
        "email": "project@nexus.com",
        "username": "project",
        "name": "Project Manager",
        "password": "project123",
        "role": "Project Manager",
        "permissions": ["worklist", "projects", "profile"]
    }
}

class AuthService:
    def authenticate_user(self, payload: LoginRequest) -> LoginResponse:
        email_key = (payload.email or "").strip().lower()
        password = payload.password or ""

        # Allow matching by email or username
        user_record = None
        for u_email, u_data in USERS_DATABASE.items():
            if email_key == u_email.lower() or email_key == u_data["username"].lower():
                user_record = u_data
                break

        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Verify password
        if user_record["password"] != password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Generate a session token
        token_hash = hashlib.sha256(f"{user_record['id']}-{user_record['role']}-nexus-session".encode()).hexdigest()
        token = f"nxtkn_{token_hash[:32]}"

        user_info = UserInfo(
            id=user_record["id"],
            email=user_record["email"],
            name=user_record["name"],
            role=user_record["role"],
            token=token,
            permissions=user_record["permissions"]
        )

        return LoginResponse(
            success=True,
            message="Authentication successful",
            user=user_info
        )

    def get_user_by_token(self, token: str) -> Optional[UserInfo]:
        if not token:
            return None
        for u in USERS_DATABASE.values():
            token_hash = hashlib.sha256(f"{u['id']}-{u['role']}-nexus-session".encode()).hexdigest()
            expected_token = f"nxtkn_{token_hash[:32]}"
            if token == expected_token or token == u["id"]:
                return UserInfo(
                    id=u["id"],
                    email=u["email"],
                    name=u["name"],
                    role=u["role"],
                    token=expected_token,
                    permissions=u["permissions"]
                )
        return None

auth_service = AuthService()
