from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class FinanceBase(BaseModel):
    amount: float
    date: Optional[datetime] = None

class IncomeCreate(FinanceBase):
    source: str
    description: Optional[str] = None

class IncomeResponse(FinanceBase):
    id: int
    user_id: int
    source: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class ExpenseCreate(FinanceBase):
    category: str
    description: Optional[str] = None

class ExpenseResponse(FinanceBase):
    id: int
    user_id: int
    category: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class LoanCreate(BaseModel):
    loan_amount: float
    interest_rate: float
    remaining_amount: float

class LoanResponse(LoanCreate):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class DashboardMetrics(BaseModel):
    netWorth: float
    monthlyIncome: float
    monthlyExpenses: float
    savingsRate: float
    financialHealthScore: float
    insights: List[str]
    forecastedNextMonth: Optional[float] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    type: str
    category: str
    amount: float
    date: datetime
    description: Optional[str] = None
    class Config:
        from_attributes = True

class MonthlySummaryItem(BaseModel):
    month: str
    income: float
    expense: float

class AssetCreate(BaseModel):
    name: str
    type: Optional[str] = None
    value: float

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    value: Optional[float] = None

class AssetResponse(BaseModel):
    id: int
    user_id: int
    name: str
    type: Optional[str] = None
    value: float
    created_at: datetime
    class Config:
        from_attributes = True

class LiabilityCreate(BaseModel):
    name: str
    type: Optional[str] = None
    amount: float
    interest_rate: float

class LiabilityUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    amount: Optional[float] = None
    interest_rate: Optional[float] = None

class LiabilityResponse(BaseModel):
    id: int
    user_id: int
    name: str
    type: Optional[str] = None
    amount: float
    interest_rate: float
    created_at: datetime
    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    type: str

class CategoryResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    type: str
    created_at: datetime
    class Config:
        from_attributes = True

class BudgetCreate(BaseModel):
    category_id: int
    budget_amount: float
    month: int
    year: int

class BudgetUpdate(BaseModel):
    budget_amount: float

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category_id: Optional[int] = None
    budget_amount: float
    month: int
    year: int
    category_name: Optional[str] = None
    spent: float = 0.0

class SubscriptionCreate(BaseModel):
    name: str
    amount: float
    billing_cycle: str
    next_payment_date: date
    active: Optional[bool] = True
    last_used: Optional[date] = None

class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    billing_cycle: Optional[str] = None
    next_payment_date: Optional[date] = None
    active: Optional[bool] = None
    last_used: Optional[date] = None

class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    name: str
    amount: float
    billing_cycle: str
    next_payment_date: Optional[date] = None
    active: Optional[bool] = True
    last_used: Optional[date] = None
    class Config:
        from_attributes = True

class IncomeUpdateRequest(BaseModel):
    income: float

