from sqlalchemy.orm import Session
from app.services import finance_service
from app.ai_engine import financial_score_model, forecasting_model
from app.models.user_finance import Expense


def get_ai_insights(db: Session, user_id: int, skip_finance_call: bool = False, raw_metrics: dict = None):
    if skip_finance_call and raw_metrics:
        metrics = raw_metrics
    else:
        metrics = finance_service.get_dashboard_metrics(db, user_id)

    # Realistic calculations
    # Emergency fund: months of expenses covered by assets (assuming liquid assets for simplicity)
    monthly_exp = metrics.get('monthlyExpenses', 0.0)
    emergency_fund_ratio = (metrics.get('totalAssets', 0.0) / monthly_exp) if monthly_exp > 0 else 10.0
    
    # Debt to Income ratio
    monthly_inc = metrics.get('monthlyIncome', 0.0)
    # Using total liabilities / annual income * 12 or just monthly income. 
    # Usually DTI is monthly debt payments / monthly gross income.
    # We don't have monthly debt payments explicitly for all liabilities, 
    # so we'll estimate it as a % of total liabilities.
    estimated_monthly_debt = metrics.get('totalLiabilities', 0.0) * 0.05 # 5% of total debt
    debt_to_income = (estimated_monthly_debt / monthly_inc) if monthly_inc > 0 else 0.0

    health_score = financial_score_model.calculate_financial_health(
        metrics['savingsRate'], debt_to_income, emergency_fund_ratio
    )
    recommendations = financial_score_model.generate_recommendations(metrics)

    expenses = db.query(Expense.date, Expense.amount).filter(Expense.user_id == user_id).all()
    forecast = forecasting_model.forecast_expenses(expenses) if expenses else 0.0

    return {
        "score": health_score,
        "recommendations": recommendations,
        "forecastedNextMonth": forecast,
        "metrics": {
            **metrics,
            "emergencyFundRatio": emergency_fund_ratio,
            "debtToIncome": debt_to_income
        }
    }
