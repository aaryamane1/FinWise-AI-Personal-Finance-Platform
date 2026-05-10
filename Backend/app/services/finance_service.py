from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from typing import List, Optional
from app.models.user_finance import (
    Income, Expense, Loan, Transaction,
    Asset, Liability, Category, Budget, Subscription,
)
from app.schemas.finance_schema import (
    IncomeCreate, ExpenseCreate, LoanCreate,
    AssetCreate, AssetUpdate, LiabilityCreate, LiabilityUpdate,
    CategoryCreate, BudgetCreate, BudgetUpdate,
    SubscriptionCreate, SubscriptionUpdate,
    IncomeUpdateRequest,
)
from app.models.user_finance import User

# ── Income ────────────────────────────────────────────────────────────────────

def get_user_incomes(db: Session, user_id: int):
    return db.query(Income).filter(Income.user_id == user_id).all()

def create_user_income(db: Session, user_id: int, income_in: IncomeCreate):
    db_income = Income(
        user_id=user_id,
        amount=income_in.amount,
        source=income_in.source,
        description=income_in.description,
        date=income_in.date or datetime.now()
    )
    db.add(db_income)
    transaction = Transaction(
        user_id=user_id, type="income", category="Income",
        amount=income_in.amount,
        description=income_in.description or income_in.source,
        date=income_in.date or datetime.now()
    )
    db.add(transaction)
    db.commit()
    db.refresh(db_income)
    return db_income

# ── Expense ───────────────────────────────────────────────────────────────────

def get_user_expenses(db: Session, user_id: int):
    return db.query(Expense).filter(Expense.user_id == user_id).all()

def create_user_expense(db: Session, user_id: int, expense_in: ExpenseCreate):
    db_expense = Expense(
        user_id=user_id,
        category=expense_in.category,
        amount=expense_in.amount,
        description=expense_in.description,
        date=expense_in.date or datetime.now()
    )
    db.add(db_expense)
    transaction = Transaction(
        user_id=user_id, type="expense",
        category=expense_in.category,
        amount=expense_in.amount,
        description=expense_in.description or expense_in.category,
        date=expense_in.date or datetime.now()
    )
    db.add(transaction)
    db.commit()
    db.refresh(db_expense)
    return db_expense

# ── Loans ─────────────────────────────────────────────────────────────────────

def get_user_loans(db: Session, user_id: int):
    return db.query(Loan).filter(Loan.user_id == user_id).all()

def create_user_loan(db: Session, user_id: int, loan_in: LoanCreate):
    db_loan = Loan(user_id=user_id, **loan_in.dict())
    db.add(db_loan)
    transaction = Transaction(
        user_id=user_id, type="loan", category="Loan",
        amount=loan_in.loan_amount,
        description=f"New Loan: ${loan_in.loan_amount:,.2f}",
        date=datetime.now()
    )
    db.add(transaction)
    db.commit()
    db.refresh(db_loan)
    return db_loan

def delete_user_loan(db: Session, user_id: int, loan_id: int) -> bool:
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == user_id).first()
    if not loan:
        return False
    db.delete(loan)
    db.commit()
    return True

# ── Transactions ──────────────────────────────────────────────────────────────

def get_user_transactions(db: Session, user_id: int, limit: int = 50):
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc())
        .limit(limit)
        .all()
    )

def delete_user_transaction(db: Session, user_id: int, transaction_id: int) -> bool:
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id, Transaction.user_id == user_id
    ).first()
    if not tx:
        return False
    # Cascade: also remove the paired Expense or Income record to keep tables consistent
    if tx.type == "expense":
        paired = db.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.amount == tx.amount,
            Expense.category == tx.category,
        ).order_by(Expense.id.desc()).first()
        if paired:
            db.delete(paired)
    elif tx.type == "income":
        paired = db.query(Income).filter(
            Income.user_id == user_id,
            Income.amount == tx.amount,
        ).order_by(Income.id.desc()).first()
        if paired:
            db.delete(paired)
    db.delete(tx)
    db.commit()
    return True

def update_user_transaction(db: Session, user_id: int, transaction_id: int, data: dict) -> Optional[Transaction]:
    tx = db.query(Transaction).filter(
        Transaction.id == transaction_id, Transaction.user_id == user_id
    ).first()
    if not tx:
        return None
    for field, value in data.items():
        if value is not None:
            setattr(tx, field, value)
    db.commit()
    db.refresh(tx)
    return tx

# ── Monthly Summary ───────────────────────────────────────────────────────────

def get_monthly_summary(db: Session, user_id: int, months: int = 7):
    from dateutil.relativedelta import relativedelta
    now = datetime.now()
    result = []
    for i in range(months - 1, -1, -1):
        dt = now - relativedelta(months=i)
        m, y = dt.month, dt.year
        inc = db.query(func.sum(Income.amount)).filter(
            Income.user_id == user_id,
            extract("month", Income.date) == m,
            extract("year", Income.date) == y,
        ).scalar() or 0.0
        exp = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == user_id,
            extract("month", Expense.date) == m,
            extract("year", Expense.date) == y,
        ).scalar() or 0.0
        result.append({"month": dt.strftime("%b"), "income": inc, "expense": exp})
    return result

# ── Dashboard ─────────────────────────────────────────────────────────────────

def get_dashboard_metrics(db: Session, user_id: int):
    from app.services.analytics_service import get_ai_insights

    month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    user = db.query(User).filter(User.id == user_id).first()
    
    if user and user.monthly_income and user.monthly_income > 0:
        total_income = user.monthly_income
    else:
        total_income = db.query(func.sum(Income.amount)).filter(
            Income.user_id == user_id, Income.date >= month_start
        ).scalar() or 0.0

    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user_id, Expense.date >= month_start
    ).scalar() or 0.0

    # Net worth = assets - liabilities (correct formula)
    total_assets = db.query(func.sum(Asset.value)).filter(Asset.user_id == user_id).scalar() or 0.0
    total_liabilities = db.query(func.sum(Liability.amount)).filter(Liability.user_id == user_id).scalar() or 0.0
    net_worth = total_assets - total_liabilities

    savings_rate = 0.0
    if total_income > 0:
        savings_rate = ((total_income - total_expenses) / total_income) * 100

    try:
        ai_data = get_ai_insights(db, user_id, skip_finance_call=True,
                                  raw_metrics={
                                      "monthlyIncome": total_income,
                                      "monthlyExpenses": total_expenses,
                                      "savingsRate": savings_rate,
                                      "netWorth": net_worth,
                                      "totalAssets": total_assets,
                                      "totalLiabilities": total_liabilities
                                  })
        health_score = ai_data["score"]
        insights = ai_data["recommendations"]
        forecast = ai_data["forecastedNextMonth"]
    except Exception:
        health_score = 7.0
        insights = ["Track more expenses to get customized AI insights"]
        forecast = None

    return {
        "netWorth": net_worth,
        "totalAssets": total_assets,
        "totalLiabilities": total_liabilities,
        "monthlyIncome": total_income,
        "monthlyExpenses": total_expenses,
        "savingsRate": savings_rate,
        "financialHealthScore": health_score,
        "insights": insights,
        "forecastedNextMonth": forecast,
    }

def update_user_income(db: Session, user_id: int, income_in: IncomeUpdateRequest):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.monthly_income = income_in.income
        db.commit()
        db.refresh(user)
    return {"status": "success", "income": income_in.income}

# ── Net Worth (lightweight) ─────────────────────────────────────────────────────

def get_net_worth(db: Session, user_id: int) -> dict:
    """Quick net-worth check without AI-insights overhead."""
    total_assets = db.query(func.sum(Asset.value)).filter(Asset.user_id == user_id).scalar() or 0.0
    total_liabilities = db.query(func.sum(Liability.amount)).filter(Liability.user_id == user_id).scalar() or 0.0
    return {
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": total_assets - total_liabilities,
    }

# ── Assets ────────────────────────────────────────────────────────────────────

def get_user_assets(db: Session, user_id: int) -> List[Asset]:
    return db.query(Asset).filter(Asset.user_id == user_id).all()

def create_user_asset(db: Session, user_id: int, asset_in: AssetCreate) -> Asset:
    db_asset = Asset(user_id=user_id, name=asset_in.name, type=asset_in.type, value=asset_in.value)
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def update_user_asset(db: Session, user_id: int, asset_id: int, asset_in: AssetUpdate) -> Optional[Asset]:
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.user_id == user_id).first()
    if not asset:
        return None
    for field, value in asset_in.dict(exclude_unset=True).items():
        setattr(asset, field, value)
    db.commit()
    db.refresh(asset)
    return asset

def delete_user_asset(db: Session, user_id: int, asset_id: int) -> bool:
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.user_id == user_id).first()
    if not asset:
        return False
    db.delete(asset)
    db.commit()
    return True

# ── Liabilities ───────────────────────────────────────────────────────────────

def get_user_liabilities(db: Session, user_id: int) -> List[Liability]:
    return db.query(Liability).filter(Liability.user_id == user_id).all()

def create_user_liability(db: Session, user_id: int, liability_in: LiabilityCreate) -> Liability:
    db_liability = Liability(
        user_id=user_id, name=liability_in.name, type=liability_in.type,
        amount=liability_in.amount, interest_rate=liability_in.interest_rate,
    )
    db.add(db_liability)
    db.commit()
    db.refresh(db_liability)
    return db_liability

def update_user_liability(db: Session, user_id: int, liability_id: int, liability_in: LiabilityUpdate) -> Optional[Liability]:
    liability = db.query(Liability).filter(Liability.id == liability_id, Liability.user_id == user_id).first()
    if not liability:
        return None
    for field, value in liability_in.dict(exclude_unset=True).items():
        setattr(liability, field, value)
    db.commit()
    db.refresh(liability)
    return liability

def delete_user_liability(db: Session, user_id: int, liability_id: int) -> bool:
    liability = db.query(Liability).filter(Liability.id == liability_id, Liability.user_id == user_id).first()
    if not liability:
        return False
    db.delete(liability)
    db.commit()
    return True

# ── Categories ────────────────────────────────────────────────────────────────

def create_user_category(db: Session, user_id: int, category_in: CategoryCreate) -> Category:
    db_category = Category(user_id=user_id, name=category_in.name, type=category_in.type)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_user_categories(db: Session, user_id: int) -> List[Category]:
    return (
        db.query(Category)
        .filter((Category.user_id == user_id) | (Category.user_id.is_(None)))
        .order_by(Category.name.asc())
        .all()
    )

def delete_user_category(db: Session, user_id: int, category_id: int) -> bool:
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == user_id).first()
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True

# ── Budgets ───────────────────────────────────────────────────────────────────

def create_user_budget(db: Session, user_id: int, budget_in: BudgetCreate) -> Budget:
    db_budget = Budget(
        user_id=user_id, category_id=budget_in.category_id,
        budget_amount=budget_in.budget_amount, month=budget_in.month, year=budget_in.year,
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_user_budgets(db: Session, user_id: int) -> List[Budget]:
    return db.query(Budget).filter(Budget.user_id == user_id).all()

def get_budget_spent(db: Session, user_id: int, category_name: str, month: int, year: int) -> float:
    """Calculate actual spending for a budget category in a given month/year."""
    result = (
        db.query(func.sum(Expense.amount))
        .filter(
            Expense.user_id == user_id,
            Expense.category == category_name,
            extract("month", Expense.date) == month,
            extract("year", Expense.date) == year,
        )
        .scalar()
    )
    return result or 0.0

def update_user_budget(db: Session, user_id: int, budget_id: int, budget_in: BudgetUpdate) -> Optional[Budget]:
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not budget:
        return None
    budget.budget_amount = budget_in.budget_amount
    db.commit()
    db.refresh(budget)
    return budget

def delete_user_budget(db: Session, user_id: int, budget_id: int) -> bool:
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if not budget:
        return False
    db.delete(budget)
    db.commit()
    return True

# ── Subscriptions ─────────────────────────────────────────────────────────────

def create_user_subscription(db: Session, user_id: int, sub_in: SubscriptionCreate) -> Subscription:
    db_sub = Subscription(
        user_id=user_id, name=sub_in.name, amount=sub_in.amount,
        billing_cycle=sub_in.billing_cycle, next_payment_date=sub_in.next_payment_date,
        active=sub_in.active if sub_in.active is not None else True,
        last_used=sub_in.last_used,
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return db_sub

def get_user_subscriptions(db: Session, user_id: int) -> List[Subscription]:
    return db.query(Subscription).filter(Subscription.user_id == user_id).all()

def update_user_subscription(db: Session, user_id: int, sub_id: int, sub_in: SubscriptionUpdate) -> Optional[Subscription]:
    sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == user_id).first()
    if not sub:
        return None
    for field, value in sub_in.dict(exclude_unset=True).items():
        setattr(sub, field, value)
    db.commit()
    db.refresh(sub)
    return sub

def delete_user_subscription(db: Session, user_id: int, sub_id: int) -> bool:
    sub = db.query(Subscription).filter(Subscription.id == sub_id, Subscription.user_id == user_id).first()
    if not sub:
        return False
    db.delete(sub)
    db.commit()
    return True

# ── AI Assistant Context Helper ───────────────────────────────────────────────

def get_financial_profile_snapshot(db: Session, user_id: int) -> str:
    """Builds a comprehensive string snapshot of the user's financial state for LLM context."""
    month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    total_income = db.query(func.sum(Income.amount)).filter(
        Income.user_id == user_id, Income.date >= month_start
    ).scalar() or 0.0
    
    total_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == user_id, Expense.date >= month_start
    ).scalar() or 0.0
    
    total_assets = db.query(func.sum(Asset.value)).filter(Asset.user_id == user_id).scalar() or 0.0
    total_liabilities = db.query(func.sum(Liability.amount)).filter(Liability.user_id == user_id).scalar() or 0.0
    net_worth = total_assets - total_liabilities

    context = (
        f"--- FINANCIAL SNAPSHOT ---\n"
        f"Net Worth: ₹{net_worth:,.2f}\n"
        f"Total Assets: ₹{total_assets:,.2f}\n"
        f"Total Liabilities: ₹{total_liabilities:,.2f}\n"
        f"This Month's Income: ₹{total_income:,.2f}\n"
        f"This Month's Expenses: ₹{total_expenses:,.2f}\n"
        f"--------------------------"
    )
    return context
