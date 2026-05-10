from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.api.dependencies import get_current_active_user
from app.models.user_finance import User, Budget
from app.schemas.finance_schema import BudgetCreate, BudgetUpdate, BudgetResponse
from app.services import finance_service

router = APIRouter()

def _to_budget_response(budget: Budget, db: Session, user_id: int) -> BudgetResponse:
    category_name = budget.category.name if budget.category else None
    spent = 0.0
    if category_name:
        spent = finance_service.get_budget_spent(db, user_id, category_name, budget.month, budget.year)
    return BudgetResponse(
        id=budget.id, user_id=budget.user_id, category_id=budget.category_id,
        budget_amount=budget.budget_amount, month=budget.month, year=budget.year,
        category_name=category_name, spent=spent,
    )

@router.post("/", response_model=BudgetResponse)
def create_budget(budget_in: BudgetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    budget = finance_service.create_user_budget(db, current_user.id, budget_in)
    return _to_budget_response(budget, db, current_user.id)

@router.get("/", response_model=List[BudgetResponse])
def list_budgets(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    budgets = finance_service.get_user_budgets(db, current_user.id)
    return [_to_budget_response(b, db, current_user.id) for b in budgets]

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget_in: BudgetUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    budget = finance_service.update_user_budget(db, current_user.id, budget_id, budget_in)
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return _to_budget_response(budget, db, current_user.id)

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    deleted = finance_service.delete_user_budget(db, current_user.id, budget_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return {"message": "Budget deleted"}
