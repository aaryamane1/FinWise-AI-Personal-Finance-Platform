from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database.connection import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    onboarded = Column(Boolean, default=False)
    monthly_income = Column(Float, nullable=True, default=0.0)
    incomes = relationship("Income", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    loans = relationship("Loan", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    assets = relationship("Asset", back_populates="user")
    liabilities = relationship("Liability", back_populates="user")
    budgets = relationship("Budget", back_populates="user")
    categories = relationship("Category", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")

class Income(Base):
    __tablename__ = "income"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    source = Column(String)
    description = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="incomes")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String)
    amount = Column(Float)
    description = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="expenses")

class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    loan_amount = Column(Float)
    interest_rate = Column(Float)
    remaining_amount = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="loans")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)
    category = Column(String)
    amount = Column(Float)
    date = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(String)
    user = relationship("User", back_populates="transactions")

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String)
    value = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="assets")

class Liability(Base):
    __tablename__ = "liabilities"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String)
    amount = Column(Float)
    interest_rate = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="liabilities")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="categories")
    budgets = relationship("Budget", back_populates="category")

class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    budget_amount = Column(Float)
    month = Column(Integer)
    year = Column(Integer)
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Float)
    billing_cycle = Column(String)
    next_payment_date = Column(Date)
    active = Column(Boolean, default=True)
    last_used = Column(Date, nullable=True)
    user = relationship("User", back_populates="subscriptions")
