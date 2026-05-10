from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.api.dependencies import get_current_admin_user
from app.models.user_finance import User, Income, Expense
from app.schemas.auth_schema import UserInDB, UserCreate
from app.services import auth_service
from sqlalchemy import func

router = APIRouter()

@router.post("/users", response_model=UserInDB)
def create_admin_user(user_in: UserCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    """Create a new admin user (admin only)."""
    db_user = auth_service.get_user_by_email(db, user_in.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    # Force role to admin
    user_in.role = "admin"
    return auth_service.create_user(db, user_in)

@router.get("/users", response_model=List[UserInDB])
def get_all_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    return db.query(User).all()

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/analytics")
def get_global_analytics(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    total_users = db.query(func.count(User.id)).scalar()
    total_income = db.query(func.sum(Income.amount)).scalar() or 0.0
    total_expenses = db.query(func.sum(Expense.amount)).scalar() or 0.0
    
    avg_savings_rate = 0.0
    if total_income > 0:
        avg_savings_rate = ((total_income - total_expenses) / total_income) * 100
        
    return {
        "totalUsers": total_users,
        "totalVolume": total_income + total_expenses,
        "avgSavingsRate": avg_savings_rate,
        "globalSpendingTrends": [] # Placeholder
    }
