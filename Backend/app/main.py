from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import (
    auth_routes,
    finance_routes,
    insights_routes,
    admin_routes,
    asset_routes,
    liability_routes,
    budget_routes,
    category_routes,
    subscription_routes,
    loan_assessment_routes,
    assistant_routes,
)
from app.database.connection import engine, Base
from app.models import user_finance  # Ensure models are loaded

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for tunneled access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(finance_routes.router, prefix=f"{settings.API_V1_STR}/finance", tags=["finance"])
app.include_router(insights_routes.router, prefix=f"{settings.API_V1_STR}/insights", tags=["insights"])
app.include_router(admin_routes.router, prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])
app.include_router(asset_routes.router, prefix=f"{settings.API_V1_STR}/assets", tags=["assets"])
app.include_router(liability_routes.router, prefix=f"{settings.API_V1_STR}/liabilities", tags=["liabilities"])
app.include_router(budget_routes.router, prefix=f"{settings.API_V1_STR}/budgets", tags=["budgets"])
app.include_router(category_routes.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(subscription_routes.router, prefix=f"{settings.API_V1_STR}/subscriptions", tags=["subscriptions"])
app.include_router(loan_assessment_routes.router, prefix=f"{settings.API_V1_STR}/loan-assessment", tags=["loan-assessment"])
app.include_router(assistant_routes.router, prefix=f"{settings.API_V1_STR}/assistant", tags=["assistant"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI Powered Personal Finance API", "version": "v1"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
