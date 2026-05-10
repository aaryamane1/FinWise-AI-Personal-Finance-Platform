CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL,
    billing_cycle TEXT,
    next_payment_date DATE,

    FOREIGN KEY(user_id) REFERENCES users(id)
);