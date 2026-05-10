from sqlalchemy.orm import Session
from app.models.user_finance import User, Asset, Liability, Income
from app.schemas.auth_schema import UserCreate, UserUpdate, OnboardingData
from app.core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate):
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def update_user(db: Session, user_id: int, user_in: UserUpdate):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
        
    db.commit()
    db.refresh(user)
    return user

def complete_onboarding(db: Session, user_id: int, onboarding_data: OnboardingData):
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    # 1. Save Assets
    for asset_in in onboarding_data.assets:
        db_asset = Asset(
            user_id=user_id,
            name=asset_in.name,
            type=asset_in.type,
            value=asset_in.value
        )
        db.add(db_asset)
        
    # 2. Save Liabilities
    for liability_in in onboarding_data.liabilities:
        db_liability = Liability(
            user_id=user_id,
            name=liability_in.name,
            type=liability_in.type,
            amount=liability_in.amount,
            interest_rate=liability_in.interest_rate
        )
        db.add(db_liability)
        
    # 3. Save Incomes
    for income_in in onboarding_data.income:
        db_income = Income(
            user_id=user_id,
            amount=income_in.amount,
            source=income_in.source,
            description=income_in.description
        )
        db.add(db_income)
        
    # 4. Mark as onboarded
    user.onboarded = True
    
    db.commit()
    db.refresh(user)
    return user
