"""
Loan Assessment API Routes — FinWise AI Finance
================================================
Exposes two endpoints:
  POST /api/v1/loan-assessment/predict  — Run XGBoost model inference
  GET  /api/v1/loan-assessment/info     — Model metadata / health check
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

from app.api.dependencies import get_current_active_user
from app.models.user_finance import User
from app.ml_models.loan_inference import (
    predict_loan_eligibility,
    get_model_info,
    LoanInputValidationError,
    VALID_EDUCATION,
    VALID_EMPLOYMENT,
    VALID_MARITAL,
    VALID_MORTGAGE,
    VALID_DEPENDENTS,
    VALID_LOAN_PURPOSE,
    VALID_COSIGNER,
)

router = APIRouter()


# ── Request Schema ─────────────────────────────────────────────────────────────

class LoanAssessmentRequest(BaseModel):
    # Borrower profile
    age: int = Field(..., ge=18, le=100)
    income: float = Field(..., gt=0, description="Annual income")
    credit_score: int = Field(..., ge=300, le=850)
    months_employed: int = Field(..., ge=0, le=600)
    num_credit_lines: int = Field(..., ge=1, le=50)

    education: str
    employment_type: str
    marital_status: str
    has_mortgage: str
    has_dependents: str
    has_co_signer: str

    # Loan details
    loan_amount: float = Field(..., gt=0)
    loan_term: int = Field(..., ge=6, le=360)
    loan_purpose: str

    # Interest rate (optional, defaults to 7%)
    interest_rate: Optional[float] = Field(default=7.0, ge=0, le=50, description="Annual interest rate percentage")

    # ✅ NEW (instead of dti_ratio)
    existing_debt: float = Field(..., ge=0, description="Monthly debt")

    # ---- Validators (same as before) ----
    @field_validator("education")
    @classmethod
    def validate_education(cls, v):
        if v not in VALID_EDUCATION:
            raise ValueError(f"education must be one of {VALID_EDUCATION}")
        return v

    @field_validator("employment_type")
    @classmethod
    def validate_employment(cls, v):
        if v not in VALID_EMPLOYMENT:
            raise ValueError(f"employment_type must be one of {VALID_EMPLOYMENT}")
        return v

    @field_validator("marital_status")
    @classmethod
    def validate_marital(cls, v):
        if v not in VALID_MARITAL:
            raise ValueError(f"marital_status must be one of {VALID_MARITAL}")
        return v

    @field_validator("has_mortgage")
    @classmethod
    def validate_mortgage(cls, v):
        if v not in VALID_MORTGAGE:
            raise ValueError("has_mortgage must be 'Yes' or 'No'")
        return v

    @field_validator("has_dependents")
    @classmethod
    def validate_dependents(cls, v):
        if v not in VALID_DEPENDENTS:
            raise ValueError("has_dependents must be 'Yes' or 'No'")
        return v

    @field_validator("loan_purpose")
    @classmethod
    def validate_purpose(cls, v):
        if v not in VALID_LOAN_PURPOSE:
            raise ValueError(f"loan_purpose must be one of {VALID_LOAN_PURPOSE}")
        return v

    @field_validator("has_co_signer")
    @classmethod
    def validate_cosigner(cls, v):
        if v not in VALID_COSIGNER:
            raise ValueError("has_co_signer must be 'Yes' or 'No'")
        return v


# ── Response Schema ────────────────────────────────────────────────────────────

class LoanAssessmentResponse(BaseModel):
    eligible: bool
    default_probability: float
    default_probability_pct: float
    threshold_used: float
    risk_level: str
    confidence_pct: float
    explanation: str
    key_factors: List[str]


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/predict", response_model=LoanAssessmentResponse)
def assess_loan(
    request: LoanAssessmentRequest,
    current_user: User = Depends(get_current_active_user),
):
    try:
        # ✅ Compute DTI safely inside backend using actual interest rate
        monthly_income = request.income / 12

        if monthly_income <= 0:
            raise HTTPException(status_code=400, detail="Invalid income")

        # Get interest rate from request (sent as percentage, e.g., 7 for 7%)
        # Default to 7% if not provided
        interest_rate = getattr(request, 'interest_rate', 7.0) or 7.0
        annual_rate = float(interest_rate) / 100
        monthly_rate = annual_rate / 12

        # Calculate new loan's monthly payment using actual interest rate
        if monthly_rate > 0 and request.loan_term > 0:
            r = monthly_rate
            term = request.loan_term
            loan = request.loan_amount
            new_monthly_pmt = loan * (r * (1 + r) ** term) / ((1 + r) ** term - 1)
        elif request.loan_term > 0:
            new_monthly_pmt = request.loan_amount / request.loan_term
        else:
            new_monthly_pmt = 0

        # Total DTI = (existing debt + new loan payment) / monthly income
        total_monthly_obligations = request.existing_debt + new_monthly_pmt
        dti_ratio = total_monthly_obligations / monthly_income

        # ✅ Extra safety (optional but smart)
        if dti_ratio > 2:
            raise HTTPException(
                status_code=400,
                detail=f"DTI ratio too high: {round(dti_ratio,2)} (must be <= 2)"
            )

        result = predict_loan_eligibility(
            age=request.age,
            income=request.income,
            loan_amount=request.loan_amount,
            credit_score=request.credit_score,
            months_employed=request.months_employed,
            num_credit_lines=request.num_credit_lines,
            loan_term=request.loan_term,
            dti_ratio=dti_ratio,  # ✅ computed value
            education=request.education,
            employment_type=request.employment_type,
            marital_status=request.marital_status,
            has_mortgage=request.has_mortgage,
            has_dependents=request.has_dependents,
            loan_purpose=request.loan_purpose,
            has_co_signer=request.has_co_signer,
        )

    except LoanInputValidationError as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Input validation failed: {exc}",
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {exc}",
        )

    return LoanAssessmentResponse(
        eligible=result.eligible,
        default_probability=result.default_probability,
        default_probability_pct=round(result.default_probability * 100, 2),
        threshold_used=result.threshold_used,
        risk_level=result.risk_level,
        confidence_pct=result.confidence_pct,
        explanation=result.explanation,
        key_factors=result.key_factors,
    )

@router.get(
    "/info",
    summary="Model metadata and health check",
    description="Returns loaded model information including pipeline steps, threshold, and accepted feature values.",
)
def model_info(current_user: User = Depends(get_current_active_user)):
    """Return model metadata for debugging and frontend form population."""
    return get_model_info()
