from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_user,
    AuthenticatedUser
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory registered users store for API testing
USERS_DB = {
    "tester@redteam.local": {
        "user_id": "usr-001",
        "email": "tester@redteam.local",
        "password_hash": hash_password("RedTeam@2026"),
        "name": "Alex Vance (Tester)",
        "role": "SECURITY_TESTER",
        "authorized_projects": ["PRJ-101", "PRJ-102", "PRJ-GOLDEN-01"]
    },
    "lead@redteam.local": {
        "user_id": "usr-002",
        "email": "lead@redteam.local",
        "password_hash": hash_password("RedTeam@2026"),
        "name": "Jordan Reed (Lead)",
        "role": "SECURITY_LEAD",
        "authorized_projects": ["PRJ-101", "PRJ-102", "PRJ-GOLDEN-01"]
    },
    "viewer@redteam.local": {
        "user_id": "usr-003",
        "email": "viewer@redteam.local",
        "password_hash": hash_password("RedTeam@2026"),
        "name": "Morgan Blake (Viewer)",
        "role": "VIEWER",
        "authorized_projects": ["PRJ-101"]
    },
    "admin@redteam.local": {
        "user_id": "usr-admin",
        "email": "admin@redteam.local",
        "password_hash": hash_password("AdminStrongPass!2026"),
        "name": "System Administrator",
        "role": "ADMIN",
        "authorized_projects": ["*"]
    }
}

class LoginRequest(BaseModel):
    email: str = Field(..., max_length=150)
    password: str = Field(..., max_length=128)

class RegisterRequest(BaseModel):
    email: str = Field(..., max_length=150)
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., max_length=100)
    role: str = Field("SECURITY_TESTER", description="SECURITY_TESTER, VIEWER")

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

@router.post("/login", response_model=AuthResponse)
async def login_handler(req: LoginRequest):
    email_norm = req.email.strip().lower()
    user_record = USERS_DB.get(email_norm)
    if not user_record or not verify_password(req.password, user_record["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password credentials."
        )
    
    token_payload = {
        "sub": user_record["user_id"],
        "email": user_record["email"],
        "name": user_record["name"],
        "role": user_record["role"],
        "authorized_projects": user_record["authorized_projects"]
    }
    token = create_access_token(token_payload)
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user={
            "user_id": user_record["user_id"],
            "email": user_record["email"],
            "name": user_record["name"],
            "role": user_record["role"]
        }
    )

@router.post("/register", response_model=AuthResponse)
async def register_handler(req: RegisterRequest):
    email_norm = req.email.strip().lower()
    if email_norm in USERS_DB:
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")
    
    # Mass-assignment defense: Prevent client self-assigning ADMIN
    role_norm = req.role.strip().upper()
    if role_norm == "ADMIN":
        raise HTTPException(status_code=403, detail="Administrative role self-registration is strictly prohibited.")
    if role_norm not in ["SECURITY_TESTER", "SECURITY_LEAD", "VIEWER"]:
        role_norm = "SECURITY_TESTER"
    
    user_id = f"usr-{abs(hash(email_norm)) % 1000000}"
    new_user = {
        "user_id": user_id,
        "email": email_norm,
        "password_hash": hash_password(req.password),
        "name": req.name.strip(),
        "role": role_norm,
        "authorized_projects": ["PRJ-101"]
    }
    USERS_DB[email_norm] = new_user
    
    token_payload = {
        "sub": new_user["user_id"],
        "email": new_user["email"],
        "name": new_user["name"],
        "role": new_user["role"],
        "authorized_projects": new_user["authorized_projects"]
    }
    token = create_access_token(token_payload)
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user={
            "user_id": new_user["user_id"],
            "email": new_user["email"],
            "name": new_user["name"],
            "role": new_user["role"]
        }
    )

@router.get("/me")
async def get_me_handler(user: AuthenticatedUser = Depends(get_current_user)):
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "authorized_projects": user.authorized_projects
    }
