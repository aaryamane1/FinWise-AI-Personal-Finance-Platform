from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.api.dependencies import get_current_active_user
from app.models.user_finance import User
from app.schemas.finance_schema import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from app.services import finance_service

router = APIRouter()

@router.post("/", response_model=SubscriptionResponse)
def create_subscription(sub_in: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.create_user_subscription(db, current_user.id, sub_in)

@router.get("/", response_model=List[SubscriptionResponse])
def list_subscriptions(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return finance_service.get_user_subscriptions(db, current_user.id)

@router.put("/{subscription_id}", response_model=SubscriptionResponse)
def update_subscription(subscription_id: int, sub_in: SubscriptionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    sub = finance_service.update_user_subscription(db, current_user.id, subscription_id, sub_in)
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return sub

@router.delete("/{subscription_id}")
def delete_subscription(subscription_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    deleted = finance_service.delete_user_subscription(db, current_user.id, subscription_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return {"message": "Subscription removed"}
