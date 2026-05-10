CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    loan_amount REAL,
    interest_rate REAL,
    loan_term INTEGER,
    monthly_income REAL,
    existing_debt REAL,
    default_probability REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id)
);