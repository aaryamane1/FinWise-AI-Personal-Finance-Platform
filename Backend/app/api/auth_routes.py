from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from collections import defaultdict
from app.database.connection import get_db
from app.schemas.auth_schema import Token, UserCreate, UserInDB, OnboardingData
from app.api.dependencies import get_current_active_user
from app.models.user_finance import User
from app.services import auth_service
from app.core import security
from app.core.config import settings

router = APIRouter()

# ── Simple in-memory rate limiter ─────────────────────────────────────────────
# { ip: [(timestamp, ...), ...] }  — max 5 attempts per 5 minutes
_login_attempts: dict = defaultdict(list)
RATE_LIMIT_MAX     = 5
RATE_LIMIT_WINDOW  = 300  # seconds

def _check_rate_limit(ip: str):
    now = datetime.utcnow()
    attempts = _login_attempts[ip]
    # Remove old attempts outside window
    _login_attempts[ip] = [t for t in attempts if (now - t).total_seconds() < RATE_LIMIT_WINDOW]
    if len(_login_attempts[ip]) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Please try again in {RATE_LIMIT_WINDOW // 60} minutes.",
        )
    _login_attempts[ip].append(now)


@router.post("/register", response_model=UserInDB, include_in_schema=False)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.get_user_by_email(db, user_in.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    return auth_service.create_user(db, user_in)


@router.post("/login", response_model=Token)
def login_user(request: Request, db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    client_ip = request.client.host
    _check_rate_limit(client_ip)

    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Clear attempts on successful login
    _login_attempts[client_ip] = []

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, role=user.role.value, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/onboarding", response_model=UserInDB)
def complete_onboarding(
    onboarding_data: OnboardingData,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    print("DEBUG: onboarding endpoint hit")
    if current_user.onboarded:
        raise HTTPException(status_code=400, detail="User already onboarded")
    
    user = auth_service.complete_onboarding(db, current_user.id, onboarding_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
