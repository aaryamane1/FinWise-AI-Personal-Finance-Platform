from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.connection import get_db
from app.api.dependencies import get_current_user
from app.models.user_finance import User
from app.services.ai_assistant_service import ai_assistant_service
from app.services.finance_service import get_financial_profile_snapshot

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint for users to chat with the AI assistant. 
    It fetches the user's financial context to inform the LLM.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    try:
        context_str = get_financial_profile_snapshot(db, current_user.id)
        reply = await ai_assistant_service.generate_response(context_str, request.message)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
