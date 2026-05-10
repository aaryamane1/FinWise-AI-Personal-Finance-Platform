from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.api.dependencies import get_current_active_user
from app.models.user_finance import User
from app.schemas.finance_schema import CategoryCreate, CategoryResponse
from app.services import finance_service


router = APIRouter()


@router.post("/", response_model=CategoryResponse)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return finance_service.create_user_category(db, current_user.id, category_in)


@router.get("/", response_model=List[CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return finance_service.get_user_categories(db, current_user.id)


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    deleted = finance_service.delete_user_category(db, current_user.id, category_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    return {"message": "Category deleted"}

