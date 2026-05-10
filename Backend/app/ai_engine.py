from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from statistics import mean
from typing import Iterable, List, Mapping, Tuple


@dataclass
class FinancialScoreModel:
    """
    Lightweight, heuristic \"AI\" model suitable for a small app.

    It produces a 0–10 score and a set of human‑readable recommendations
    from a small set of metrics; it intentionally avoids heavy ML libraries.
    """

    def calculate_financial_health(
        self, savings_rate: float, debt_to_income: float, emergency_fund_ratio: float
    ) -> float:
        # Clamp inputs to sane ranges
        savings_rate = max(min(savings_rate, 100.0), -100.0)
        debt_to_income = max(debt_to_income, 0.0)
        emergency_fund_ratio = max(emergency_fund_ratio, 0.0)

        # Simple scoring: higher savings and emergency fund improve score,
        # higher debt-to-income lowers it.
        base = 5.0

        # Savings rate component: +/- 3 points
        if savings_rate >= 20:
            base += 3
        elif savings_rate >= 10:
            base += 2
        elif savings_rate >= 5:
            base += 1
        elif savings_rate < 0:
            base -= 2

        # Emergency fund component: up to +2
        if emergency_fund_ratio >= 6:
            base += 2
        elif emergency_fund_ratio >= 3:
            base += 1

        # Debt-to-income component: up to -3
        if debt_to_income >= 0.6:
            base -= 3
        elif debt_to_income >= 0.4:
            base -= 2
        elif debt_to_income >= 0.3:
            base -= 1

        return max(0.0, min(10.0, base))

    def generate_recommendations(self, metrics: Mapping[str, float]) -> List[str]:
        """
        Generate simple rule‑based recommendations from dashboard metrics.
        """
        recs: List[str] = []

        net_worth = metrics.get("netWorth", 0.0)
        monthly_income = metrics.get("monthlyIncome", 0.0)
        monthly_expenses = metrics.get("monthlyExpenses", 0.0)
        savings_rate = metrics.get("savingsRate", 0.0)

        # Savings guidance
        if savings_rate < 0:
            recs.append(
                "You are currently spending more than you earn. "
                "Start by cutting discretionary expenses to get back to break-even."
            )
        elif savings_rate < 5:
            recs.append(
                "Your savings rate is low. Aim to save at least 5–10% "
                "of your monthly income to build a safety buffer."
            )
        elif savings_rate < 15:
            recs.append(
                "You are saving a healthy portion of your income. "
                "Consider automating transfers into savings or investments."
            )
        else:
            recs.append(
                "Excellent savings rate. Review your investment plan to make sure "
                "your extra cash is working for you."
            )

        # Net worth guidance
        if net_worth < 0:
            recs.append(
                "Your net worth is currently negative. Focus on paying down "
                "high‑interest debt and avoiding new borrowing."
            )
        elif net_worth < monthly_income * 3:
            recs.append(
                "Build an emergency fund worth 3–6 months of expenses to "
                "protect against surprises."
            )

        # Expense guidance
        if monthly_income > 0:
            expense_ratio = monthly_expenses / monthly_income
            if expense_ratio > 0.8:
                recs.append(
                    "Your expenses are consuming most of your income. "
                    "Review recurring subscriptions and large categories to find reductions."
                )
            elif expense_ratio < 0.5:
                recs.append(
                    "You have a comfortable gap between income and expenses. "
                    "Consider directing more towards long‑term goals."
                )

        if not recs:
            recs.append("Keep tracking your income and expenses regularly.")

        return recs


@dataclass
class ForecastingModel:
    """
    Minimal expense forecaster.

    For simplicity, it just returns the average of recent expenses as the
    \"forecast\" for next month.
    """

    lookback_months: int = 3

    def forecast_expenses(self, expenses: Iterable[Tuple[datetime, float]]) -> float:
        amounts: List[float] = []
        for _, amount in expenses:
            try:
                amounts.append(float(amount))
            except (TypeError, ValueError):
                continue

        if not amounts:
            return 0.0

        return float(mean(amounts))


financial_score_model = FinancialScoreModel()
forecasting_model = ForecastingModel()

