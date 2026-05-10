from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List
from datetime import datetime
from app.schemas.finance_schema import AssetCreate, LiabilityCreate, IncomeCreate
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[UserRole] = UserRole.USER

class UserCreate(UserBase):
    # bcrypt (used via passlib) only supports passwords up to 72 bytes.
    # Enforce this limit at validation time so the API returns 422 instead
    # of a 500 from the hashing layer for very long passwords.
    password: constr(max_length=72)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None

class UserInDB(UserBase):
    id: int
    created_at: datetime
    role: str
    onboarded: bool = False

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class OnboardingData(BaseModel):
    goal: str
    assets: List[AssetCreate]
    liabilities: List[LiabilityCreate]
    income: List[IncomeCreate]
