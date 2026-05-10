from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.api.dependencies import get_current_active_user
from app.models.user_finance import User
from app.services import analytics_service

router = APIRouter()

@router.get("/")
def get_financial_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return analytics_service.get_ai_insights(db, current_user.id)
