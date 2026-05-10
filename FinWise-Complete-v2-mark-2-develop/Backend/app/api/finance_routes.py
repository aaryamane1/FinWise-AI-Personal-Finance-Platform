from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.finance_schema import (
    IncomeCreate, IncomeResponse,
    ExpenseCreate, ExpenseResponse,
    LoanCreate, LoanResponse,
    DashboardMetrics, TransactionResponse,
    MonthlySummaryItem, IncomeUpdateRequest,
)
from app.services import finance_service
from app.api.dependencies import get_current_active_user
from app.models.user_finance import User

router = APIRouter()

@router.get("/dashboard", response_model=DashboardMetrics)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.get_dashboard_metrics(db, current_user.id)

@router.get("/monthly-summary", response_model=List[MonthlySummaryItem])
def get_monthly_summary(months: int = 7, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.get_monthly_summary(db, current_user.id, months)

@router.get("/income", response_model=List[IncomeResponse])
def list_income(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.get_user_incomes(db, current_user.id)

@router.post("/income", response_model=IncomeResponse)
def add_income(income_in: IncomeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.create_user_income(db, current_user.id, income_in)

@router.put("/update-income")
def update_user_income_route(income_in: IncomeUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.update_user_income(db, current_user.id, income_in)

@router.get("/expenses", response_model=List[ExpenseResponse])
def list_expenses(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.get_user_expenses(db, current_user.id)

@router.post("/expenses", response_model=ExpenseResponse)
def add_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.create_user_expense(db, current_user.id, expense_in)

@router.get("/loans", response_model=List[LoanResponse])
def list_loans(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.get_user_loans(db, current_user.id)

@router.post("/loans", response_model=LoanResponse)
def add_loan(loan_in: LoanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.create_user_loan(db, current_user.id, loan_in)

@router.delete("/loans/{loan_id}")
def delete_loan(loan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    deleted = finance_service.delete_user_loan(db, current_user.id, loan_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Loan not found")
    return {"message": "Loan deleted"}

@router.get("/transactions", response_model=List[TransactionResponse])
def list_transactions(limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.get_user_transactions(db, current_user.id, limit)

@router.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    deleted = finance_service.delete_user_transaction(db, current_user.id, transaction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted"}

@router.get("/net-worth")
def get_net_worth(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Lightweight net-worth endpoint — does NOT run AI insights, just assets minus liabilities."""
    return finance_service.get_net_worth(db, current_user.id)

# Profile
from app.schemas.auth_schema import UserInDB, UserUpdate
from app.services import auth_service

@router.get("/profile", response_model=UserInDB)
def get_user_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/profile", response_model=UserInDB)
def update_user_profile(user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return auth_service.update_user(db, current_user.id, user_in)
