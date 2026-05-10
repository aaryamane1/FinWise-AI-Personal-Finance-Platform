from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.api.dependencies import get_current_active_user
from app.models.user_finance import User
from app.schemas.finance_schema import (
    LiabilityCreate,
    LiabilityUpdate,
    LiabilityResponse,
)
from app.services import finance_service


router = APIRouter()


@router.post("/", response_model=LiabilityResponse)
def create_liability(
    liability_in: LiabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return finance_service.create_user_liability(db, current_user.id, liability_in)


@router.get("/", response_model=List[LiabilityResponse])
def list_liabilities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return finance_service.get_user_liabilities(db, current_user.id)


@router.put("/{liability_id}", response_model=LiabilityResponse)
def update_liability(
    liability_id: int,
    liability_in: LiabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    liability = finance_service.update_user_liability(
        db, current_user.id, liability_id, liability_in
    )
    if not liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Liability not found"
        )
    return liability


@router.delete("/{liability_id}")
def delete_liability(
    liability_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    deleted = finance_service.delete_user_liability(db, current_user.id, liability_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Liability not found"
        )
    return {"message": "Liability deleted"}

