import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))

from app.ml_models.loan_inference import (
    predict_loan_eligibility,
    _engineer_features,
    _validate_numeric,
    _validate_categorical,
    LoanInputValidationError,
    get_model_info,
)


class TestNumericValidation:
    def test_valid_numeric_in_range(self):
        result = _validate_numeric("Age", 35, 18, 100)
        assert result == 35.0

    def test_valid_numeric_at_boundaries(self):
        assert _validate_numeric("Age", 18, 18, 100) == 18.0
        assert _validate_numeric("Age", 100, 18, 100) == 100.0

    def test_invalid_numeric_below_min(self):
        with pytest.raises(LoanInputValidationError):
            _validate_numeric("Age", 17, 18, 100)

    def test_invalid_numeric_above_max(self):
        with pytest.raises(LoanInputValidationError):
            _validate_numeric("Age", 101, 18, 100)

    def test_invalid_numeric_nan(self):
        with pytest.raises(LoanInputValidationError):
            _validate_numeric("Age", float("nan"), 18, 100)

    def test_invalid_numeric_none(self):
        with pytest.raises(LoanInputValidationError):
            _validate_numeric("Age", None, 18, 100)


class TestCategoricalValidation:
    def test_valid_categorical(self):
        result = _validate_categorical("Education", "Bachelor's")
        assert result == "Bachelor's"

    def test_valid_categorical_case_sensitive(self):
        with pytest.raises(LoanInputValidationError):
            _validate_categorical("Education", "bachelor's")

    def test_invalid_categorical(self):
        with pytest.raises(LoanInputValidationError):
            _validate_categorical("Education", "Unknown")


class TestFeatureEngineering:
    def test_loan_to_income_ratio(self):
        raw = {
            "Age": 30, "Income": 60000, "LoanAmount": 20000,
            "CreditScore": 700, "MonthsEmployed": 36, "NumCreditLines": 3,
            "LoanTerm": 60, "DTIRatio": 0.3,
            "Education": "Bachelor's", "EmploymentType": "Full-time",
            "MaritalStatus": "Single", "HasMortgage": "No",
            "HasDependents": "No", "LoanPurpose": "Home", "HasCoSigner": "No"
        }
        result = _engineer_features(raw)
        assert result["Loan_to_Income"] == pytest.approx(20000 / 60000, rel=0.01)

    def test_credit_per_line(self):
        raw = {
            "Age": 30, "Income": 60000, "LoanAmount": 30000,
            "CreditScore": 700, "MonthsEmployed": 36, "NumCreditLines": 5,
            "LoanTerm": 60, "DTIRatio": 0.3,
            "Education": "Bachelor's", "EmploymentType": "Full-time",
            "MaritalStatus": "Single", "HasMortgage": "No",
            "HasDependents": "No", "LoanPurpose": "Home", "HasCoSigner": "No"
        }
        result = _engineer_features(raw)
        assert result["Credit_per_Line"] == 6000

    def test_credit_per_line_zero_lines(self):
        raw = {
            "Age": 30, "Income": 60000, "LoanAmount": 30000,
            "CreditScore": 700, "MonthsEmployed": 36, "NumCreditLines": 0,
            "LoanTerm": 60, "DTIRatio": 0.3,
            "Education": "Bachelor's", "EmploymentType": "Full-time",
            "MaritalStatus": "Single", "HasMortgage": "No",
            "HasDependents": "No", "LoanPurpose": "Home", "HasCoSigner": "No"
        }
        result = _engineer_features(raw)
        assert result["Credit_per_Line"] == 30000

    def test_emi_to_income_positive_dti(self):
        raw = {
            "Age": 30, "Income": 60000, "LoanAmount": 20000,
            "CreditScore": 700, "MonthsEmployed": 36, "NumCreditLines": 3,
            "LoanTerm": 60, "DTIRatio": 0.3,
            "Education": "Bachelor's", "EmploymentType": "Full-time",
            "MaritalStatus": "Single", "HasMortgage": "No",
            "HasDependents": "No", "LoanPurpose": "Home", "HasCoSigner": "No"
        }
        result = _engineer_features(raw)
        assert result["EMI_to_Income"] > 0


class TestLoanPrediction:
    @pytest.fixture
    def valid_params(self):
        return {
            "age": 35,
            "income": 60000,
            "loan_amount": 20000,
            "credit_score": 700,
            "months_employed": 48,
            "num_credit_lines": 3,
            "loan_term": 60,
            "dti_ratio": 0.25,
            "education": "Bachelor's",
            "employment_type": "Full-time",
            "marital_status": "Single",
            "has_mortgage": "No",
            "has_dependents": "No",
            "loan_purpose": "Home",
            "has_co_signer": "No",
        }

    def test_predict_loan_eligibility_valid(self, valid_params):
        result = predict_loan_eligibility(**valid_params)
        assert result.eligible is not None
        assert 0 <= result.default_probability <= 1
        assert result.risk_level in ["Low", "Moderate", "High"]
        assert 0 <= result.confidence_pct <= 100
        assert isinstance(result.explanation, str)
        assert isinstance(result.key_factors, list)

    def test_predict_loan_high_credit_score(self):
        params = {
            "age": 35,
            "income": 100000,
            "loan_amount": 50000,
            "credit_score": 780,
            "months_employed": 60,
            "num_credit_lines": 2,
            "loan_term": 36,
            "dti_ratio": 0.2,
            "education": "Master's",
            "employment_type": "Full-time",
            "marital_status": "Married",
            "has_mortgage": "No",
            "has_dependents": "No",
            "loan_purpose": "Home",
            "has_co_signer": "No",
        }
        result = predict_loan_eligibility(**params)
        assert result.risk_level in ["Low", "Moderate"]
        assert "Strong credit score" in " ".join(result.key_factors)

    def test_predict_loan_low_credit_score(self):
        params = {
            "age": 25,
            "income": 30000,
            "loan_amount": 50000,
            "credit_score": 550,
            "months_employed": 6,
            "num_credit_lines": 5,
            "loan_term": 60,
            "dti_ratio": 0.5,
            "education": "High School",
            "employment_type": "Full-time",
            "marital_status": "Single",
            "has_mortgage": "No",
            "has_dependents": "No",
            "loan_purpose": "Other",
            "has_co_signer": "No",
        }
        result = predict_loan_eligibility(**params)
        assert result.risk_level == "High" or not result.eligible
        assert "Low credit score" in " ".join(result.key_factors)

    def test_predict_loan_high_dti(self):
        params = {
            "age": 30,
            "income": 40000,
            "loan_amount": 100000,
            "credit_score": 650,
            "months_employed": 24,
            "num_credit_lines": 4,
            "loan_term": 120,
            "dti_ratio": 0.6,
            "education": "Bachelor's",
            "employment_type": "Full-time",
            "marital_status": "Married",
            "has_mortgage": "No",
            "has_dependents": "Yes",
            "loan_purpose": "Home",
            "has_co_signer": "No",
        }
        result = predict_loan_eligibility(**params)
        assert "High debt-to-income ratio" in " ".join(result.key_factors)

    def test_predict_loan_with_cosigner(self):
        params = {
            "age": 28,
            "income": 45000,
            "loan_amount": 30000,
            "credit_score": 620,
            "months_employed": 18,
            "num_credit_lines": 2,
            "loan_term": 48,
            "dti_ratio": 0.35,
            "education": "Bachelor's",
            "employment_type": "Full-time",
            "marital_status": "Single",
            "has_mortgage": "No",
            "has_dependents": "No",
            "loan_purpose": "Auto",
            "has_co_signer": "Yes",
        }
        result = predict_loan_eligibility(**params)
        assert "Co-signer present" in " ".join(result.key_factors)

    def test_predict_loan_invalid_age_too_low(self):
        params = {
            "age": 17,
            "income": 60000,
            "loan_amount": 20000,
            "credit_score": 700,
            "months_employed": 48,
            "num_credit_lines": 3,
            "loan_term": 60,
            "dti_ratio": 0.25,
            "education": "Bachelor's",
            "employment_type": "Full-time",
            "marital_status": "Single",
            "has_mortgage": "No",
            "has_dependents": "No",
            "loan_purpose": "Home",
            "has_co_signer": "No",
        }
        with pytest.raises(LoanInputValidationError):
            predict_loan_eligibility(**params)

    def test_predict_loan_invalid_credit_score(self):
        params = {
            "age": 35,
            "income": 60000,
            "loan_amount": 20000,
            "credit_score": 200,
            "months_employed": 48,
            "num_credit_lines": 3,
            "loan_term": 60,
            "dti_ratio": 0.25,
            "education": "Bachelor's",
            "employment_type": "Full-time",
            "marital_status": "Single",
            "has_mortgage": "No",
            "has_dependents": "No",
            "loan_purpose": "Home",
            "has_co_signer": "No",
        }
        with pytest.raises(LoanInputValidationError):
            predict_loan_eligibility(**params)

    def test_predict_loan_invalid_education(self):
        params = {
            "age": 35,
            "income": 60000,
            "loan_amount": 20000,
            "credit_score": 700,
            "months_employed": 48,
            "num_credit_lines": 3,
            "loan_term": 60,
            "dti_ratio": 0.25,
            "education": "Invalid",
            "employment_type": "Full-time",
            "marital_status": "Single",
            "has_mortgage": "No",
            "has_dependents": "No",
            "loan_purpose": "Home",
            "has_co_signer": "No",
        }
        with pytest.raises(LoanInputValidationError):
            predict_loan_eligibility(**params)


class TestModelInfo:
    def test_get_model_info(self):
        info = get_model_info()
        assert info["status"] == "loaded"
        assert "pipeline_steps" in info
        assert "threshold" in info
        assert "num_input_features" in info
        assert info["num_input_features"] == 18
        assert "categorical_options" in info


class TestDTIIntegration:
    def test_dti_calculation_with_new_loan(self):
        monthly_income = 5000
        existing_debt = 500
        loan_amount = 20000
        loan_term = 60
        interest_rate = 0.07
        r = interest_rate / 12
        monthly_pmt = (loan_amount * r * (1 + r) ** loan_term) / ((1 + r) ** loan_term - 1)
        total_debt = existing_debt + monthly_pmt
        dti = total_debt / monthly_income
        assert dti > 0
        assert monthly_pmt > 0

    def test_dti_without_existing_debt(self):
        monthly_income = 5000
        existing_debt = 0
        loan_amount = 15000
        loan_term = 36
        r = 0.07 / 12
        monthly_pmt = (loan_amount * r * (1 + r) ** loan_term) / ((1 + r) ** loan_term - 1)
        total_debt = existing_debt + monthly_pmt
        dti = total_debt / monthly_income
        assert dti > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])