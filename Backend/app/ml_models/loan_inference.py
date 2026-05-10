"""
Loan Assessment Inference Engine — FinWise AI Finance
======================================================
Loads the trained XGBoost pipeline and exposes a single `predict_loan_eligibility`
function that validates inputs, engineers features, runs inference, and returns a
structured result ready for the API layer.

Pipeline structure (loaded via joblib):
  preprocessor  → ColumnTransformer (OHE for categoricals, passthrough for numerics)
  smote         → SMOTE (training-only; skipped at inference automatically)
  classifier    → XGBClassifier

Threshold (from optimised_xgb_threshold.pkl): 0.6387
  P(default) >= threshold  →  REJECTED
  P(default) <  threshold  →  APPROVED
"""

from __future__ import annotations

import logging
import pathlib
from dataclasses import dataclass
from typing import Optional

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ── Paths ────────────────────────────────────────────────────────────────────
_ML_DIR = pathlib.Path(__file__).parent
_PIPELINE_PATH = _ML_DIR / "optimised_xgb_pipeline.pkl"
_THRESHOLD_PATH = _ML_DIR / "optimised_xgb_threshold.pkl"

# ── Feature schema ────────────────────────────────────────────────────────────
# Exact raw feature names the pipeline was trained on (in order)
RAW_FEATURES: list[str] = [
    "Age", "Income", "LoanAmount", "CreditScore",
    "MonthsEmployed", "NumCreditLines", "LoanTerm", "DTIRatio",
    "Education", "EmploymentType", "MaritalStatus",
    "HasMortgage", "HasDependents", "LoanPurpose", "HasCoSigner",
    # Engineered features (computed from raw inputs)
    "Loan_to_Income", "EMI_to_Income", "Credit_per_Line",
]

NUMERIC_FEATURES = [
    "Age", "Income", "LoanAmount", "CreditScore",
    "MonthsEmployed", "NumCreditLines", "LoanTerm", "DTIRatio",
    "Loan_to_Income", "EMI_to_Income", "Credit_per_Line",
]

CATEGORICAL_FEATURES = [
    "Education", "EmploymentType", "MaritalStatus",
    "HasMortgage", "HasDependents", "LoanPurpose", "HasCoSigner",
]

# Valid categorical values (mirrors training data)
VALID_EDUCATION      = ["Bachelor's", "High School", "Master's", "PhD"]
VALID_EMPLOYMENT     = ["Full-time", "Part-time", "Self-employed", "Unemployed"]
VALID_MARITAL        = ["Single", "Married", "Divorced"]
VALID_MORTGAGE       = ["Yes", "No"]
VALID_DEPENDENTS     = ["Yes", "No"]
VALID_LOAN_PURPOSE   = ["Home", "Auto", "Business", "Education", "Other"]
VALID_COSIGNER       = ["Yes", "No"]

CATEGORICAL_VALID_MAP: dict[str, list[str]] = {
    "Education":      VALID_EDUCATION,
    "EmploymentType": VALID_EMPLOYMENT,
    "MaritalStatus":  VALID_MARITAL,
    "HasMortgage":    VALID_MORTGAGE,
    "HasDependents":  VALID_DEPENDENTS,
    "LoanPurpose":    VALID_LOAN_PURPOSE,
    "HasCoSigner":    VALID_COSIGNER,
}

# ── Lazy-loaded model state ───────────────────────────────────────────────────
_pipeline = None
_threshold: float = 0.6386587023735046  # fallback default from optimised_results.csv


def _load_model() -> tuple:
    """Load pipeline and threshold from disk (once, cached in module globals)."""
    global _pipeline, _threshold
    if _pipeline is not None:
        return _pipeline, _threshold

    try:
        _pipeline = joblib.load(_PIPELINE_PATH)
        logger.info("XGBoost pipeline loaded successfully from %s", _PIPELINE_PATH)
    except FileNotFoundError:
        raise RuntimeError(
            f"Model pipeline not found at {_PIPELINE_PATH}. "
            "Ensure optimised_xgb_pipeline.pkl is present in the ml_models directory."
        )
    except Exception as exc:
        raise RuntimeError(f"Failed to load XGBoost pipeline: {exc}") from exc

    try:
        import pickle
        with open(_THRESHOLD_PATH, "rb") as fh:
            _threshold = pickle.load(fh)
        logger.info("Decision threshold loaded: %.6f", _threshold)
    except Exception as exc:
        logger.warning(
            "Could not load threshold file (%s). Using default %.6f. Error: %s",
            _THRESHOLD_PATH, _threshold, exc,
        )

    return _pipeline, _threshold


# ── Validation helpers ────────────────────────────────────────────────────────

class LoanInputValidationError(ValueError):
    """Raised when input data fails validation checks."""


def _validate_numeric(name: str, value: float, min_val: float, max_val: float) -> float:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        raise LoanInputValidationError(f"'{name}' must not be null or NaN.")
    if not (min_val <= value <= max_val):
        raise LoanInputValidationError(
            f"'{name}' value {value} is out of acceptable range [{min_val}, {max_val}]."
        )
    return float(value)


def _validate_categorical(name: str, value: str) -> str:
    valid = CATEGORICAL_VALID_MAP[name]
    if value not in valid:
        raise LoanInputValidationError(
            f"'{name}' value '{value}' is not valid. Must be one of: {valid}."
        )
    return value


# ── Feature engineering ───────────────────────────────────────────────────────

def _engineer_features(raw: dict) -> dict:
    """
    Compute the three derived features the model was trained with:
      Loan_to_Income  = LoanAmount / Income
      EMI_to_Income   = monthly_emi / (Income / 12)
        where monthly_emi = EMI derived from LoanAmount, DTIRatio, LoanTerm
      Credit_per_Line = LoanAmount / NumCreditLines
    """
    loan   = raw["LoanAmount"]
    income = raw["Income"]
    term   = raw["LoanTerm"]          # months
    n_lines = raw["NumCreditLines"]

    # Loan-to-income ratio
    loan_to_income = loan / income if income > 0 else 0.0

    # Monthly EMI estimate (standard amortisation; DTIRatio used as interest proxy)
    # The model was trained with EMI_to_Income = (monthly EMI) / (monthly income)
    monthly_income = income / 12.0
    # Use a simple monthly payment estimation based on DTIRatio * monthly_income
    # which approximates total monthly obligations
    dti = raw["DTIRatio"]
    total_monthly_obligations = dti * monthly_income
    # Rough EMI estimate for this loan based on its proportion of total loan amount
    # A cleaner estimate: assume a fixed-rate loan payment
    r = dti / 12.0  # rough monthly rate approximation
    if r > 0 and term > 0:
        emi = loan * (r * (1 + r) ** term) / ((1 + r) ** term - 1)
    elif term > 0:
        emi = loan / term
    else:
        emi = 0.0
    emi_to_income = emi / monthly_income if monthly_income > 0 else 0.0

    # Credit per line
    credit_per_line = loan / n_lines if n_lines > 0 else loan

    return {
        **raw,
        "Loan_to_Income":  loan_to_income,
        "EMI_to_Income":   emi_to_income,
        "Credit_per_Line": credit_per_line,
    }


# ── Result dataclass ──────────────────────────────────────────────────────────

@dataclass
class LoanAssessmentResult:
    eligible: bool                   # True = approved, False = rejected
    default_probability: float       # P(default) from the model
    threshold_used: float            # Decision threshold applied
    risk_level: str                  # "Low" / "Moderate" / "High"
    confidence_pct: float            # Confidence in the decision (0-100)
    explanation: str                 # Human-readable verdict
    key_factors: list[str]           # Top risk factors from feature importance


# ── Public inference API ──────────────────────────────────────────────────────

def predict_loan_eligibility(
    age: int,
    income: float,
    loan_amount: float,
    credit_score: int,
    months_employed: int,
    num_credit_lines: int,
    loan_term: int,
    dti_ratio: float,
    education: str,
    employment_type: str,
    marital_status: str,
    has_mortgage: str,
    has_dependents: str,
    loan_purpose: str,
    has_co_signer: str,
) -> LoanAssessmentResult:
    """
    Run the XGBoost loan eligibility model and return a structured assessment.

    Parameters map directly to the 15 raw features the model was trained on.
    The three engineered features (Loan_to_Income, EMI_to_Income, Credit_per_Line)
    are computed internally.

    Returns
    -------
    LoanAssessmentResult
        Eligibility verdict, probability, risk level, and explanatory text.

    Raises
    ------
    LoanInputValidationError
        If any input value fails range or categorical validation.
    RuntimeError
        If the model pipeline cannot be loaded.
    """
    # ── 1. Validate inputs ────────────────────────────────────────────────────
    age              = int(_validate_numeric("Age",            age,            18,  100))
    income           = _validate_numeric("Income",             income,         1,   1e8)
    loan_amount      = _validate_numeric("LoanAmount",         loan_amount,    100, 1e8)
    credit_score     = int(_validate_numeric("CreditScore",    credit_score,   300, 850))
    months_employed  = int(_validate_numeric("MonthsEmployed", months_employed, 0,  600))
    num_credit_lines = int(_validate_numeric("NumCreditLines", num_credit_lines,1,  50))
    loan_term        = int(_validate_numeric("LoanTerm",       loan_term,       6,  360))
    dti_ratio        = _validate_numeric("DTIRatio",           dti_ratio,       0.0, 2.0)

    education        = _validate_categorical("Education",      education)
    employment_type  = _validate_categorical("EmploymentType", employment_type)
    marital_status   = _validate_categorical("MaritalStatus",  marital_status)
    has_mortgage     = _validate_categorical("HasMortgage",    has_mortgage)
    has_dependents   = _validate_categorical("HasDependents",  has_dependents)
    loan_purpose     = _validate_categorical("LoanPurpose",    loan_purpose)
    has_co_signer    = _validate_categorical("HasCoSigner",    has_co_signer)

    # ── 2. Assemble raw feature dict & engineer derived features ──────────────
    raw = {
        "Age": age, "Income": income, "LoanAmount": loan_amount,
        "CreditScore": credit_score, "MonthsEmployed": months_employed,
        "NumCreditLines": num_credit_lines, "LoanTerm": loan_term,
        "DTIRatio": dti_ratio, "Education": education,
        "EmploymentType": employment_type, "MaritalStatus": marital_status,
        "HasMortgage": has_mortgage, "HasDependents": has_dependents,
        "LoanPurpose": loan_purpose, "HasCoSigner": has_co_signer,
    }
    features = _engineer_features(raw)

    # ── 3. Build DataFrame in exact feature order ─────────────────────────────
    df = pd.DataFrame([features])[RAW_FEATURES]

    # ── 4. Load model & run inference ─────────────────────────────────────────
    pipeline, threshold = _load_model()

    try:
        # SMOTE in the pipeline is a no-op at inference (it only processes during fit)
        proba_default = float(pipeline.predict_proba(df)[0][1])
    except Exception as exc:
        logger.error("Model inference failed: %s", exc)
        raise RuntimeError(f"Loan assessment inference failed: {exc}") from exc

    # ── 5. Apply threshold & compute risk level ───────────────────────────────
    eligible = proba_default < threshold

    if proba_default < 0.35:
        risk_level = "Low"
    elif proba_default < threshold:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    # Confidence = distance from 0.5 mapped to 0-100
    confidence_pct = round(abs(proba_default - 0.5) * 200, 1)

    # ── 6. Build explanation & key factors ───────────────────────────────────
    if eligible:
        explanation = (
            f"Based on our AI model, this loan application is likely to be "
            f"APPROVED. The estimated default probability is "
            f"{proba_default * 100:.1f}%, which is below the risk threshold of "
            f"{threshold * 100:.1f}%."
        )
    else:
        explanation = (
            f"Based on our AI model, this loan application carries HIGH DEFAULT RISK "
            f"and would likely be REJECTED. The estimated default probability is "
            f"{proba_default * 100:.1f}%, exceeding the threshold of "
            f"{threshold * 100:.1f}%."
        )

    key_factors = _build_key_factors(features, eligible)

    logger.info(
        "Loan assessment: eligible=%s proba=%.4f threshold=%.4f risk=%s",
        eligible, proba_default, threshold, risk_level,
    )

    return LoanAssessmentResult(
        eligible=eligible,
        default_probability=round(proba_default, 6),
        threshold_used=round(threshold, 6),
        risk_level=risk_level,
        confidence_pct=confidence_pct,
        explanation=explanation,
        key_factors=key_factors,
    )


def _build_key_factors(features: dict, eligible: bool) -> list[str]:
    """Generate human-readable key risk/positive factors from the input."""
    factors = []

    dti   = features["DTIRatio"]
    lti   = features["Loan_to_Income"]
    score = features["CreditScore"]
    emp   = features["MonthsEmployed"]
    eti   = features["EMI_to_Income"]

    if score >= 720:
        factors.append(f"Strong credit score ({score})")
    elif score <= 580:
        factors.append(f"Low credit score ({score}) — significant risk factor")
    elif score <= 650:
        factors.append(f"Moderate credit score ({score})")

    if dti < 0.28:
        factors.append(f"Healthy debt-to-income ratio ({dti * 100:.0f}%)")
    elif dti > 0.43:
        factors.append(f"High debt-to-income ratio ({dti * 100:.0f}%) — reduces approval odds")

    if lti > 5:
        factors.append(f"Loan amount is {lti:.1f}x annual income — considered high")
    elif lti < 1:
        factors.append(f"Loan amount is well within annual income ({lti:.2f}x)")

    if emp >= 36:
        factors.append(f"Stable employment ({emp} months)")
    elif emp < 12:
        factors.append(f"Short employment history ({emp} months) — increases risk")

    if features["HasCoSigner"] == "Yes":
        factors.append("Co-signer present — reduces lender risk")
    if features["HasMortgage"] == "Yes":
        factors.append("Existing mortgage — additional debt obligation")
    if features["HasDependents"] == "Yes":
        factors.append("Has dependents — affects disposable income")

    return factors[:5]  # Return top 5 most relevant


def get_model_info() -> dict:
    """Return metadata about the loaded model for health checks and debugging."""
    try:
        pipeline, threshold = _load_model()
        return {
            "status": "loaded",
            "pipeline_steps": list(pipeline.named_steps.keys()),
            "threshold": threshold,
            "num_input_features": len(RAW_FEATURES),
            "input_features": RAW_FEATURES,
            "categorical_options": CATEGORICAL_VALID_MAP,
        }
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}
