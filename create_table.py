# drop_create_seed.py
import os
import sqlite3
from datetime import datetime
import uuid

DB_FILE = os.path.join(os.path.dirname(__file__), "takenoko.db")

def main():
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()

    # ===== DROP (子 → 親) =====
    cur.execute("DROP TABLE IF EXISTS request_links")
    cur.execute("DROP TABLE IF EXISTS users")

    # ===== CREATE (親 → 子) =====
    cur.execute("""
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        account_number TEXT NOT NULL,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0
    )
    """)

    cur.execute("""
    CREATE TABLE request_links (
        id TEXT PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'created',
        created_at TEXT NOT NULL,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # ===== SEED =====
    users = [
        (1, "0123456", "佐藤 太郎", 150000),
        (2, "1234567", "鈴木 花子", 120000),
        (3, "2345678", "高橋 次郎", 200000),
        (4, "3456789", "田中 三郎", 80000),
        (5, "4567890", "伊藤 美咲", 50000),
        (6, "5678901", "渡辺 健一", 175000),
    ]
    cur.executemany(
        "INSERT INTO users (id, account_number, name, balance) VALUES (?, ?, ?, ?)",
        users
    )

    link_id = str(uuid.uuid4())
    current_time = datetime.now().isoformat()
    cur.execute(
        "INSERT INTO request_links (id, sender_id, amount, message, status, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (link_id, 1, 15000, "ランチ代です", "created", current_time)
    )

    conn.commit()

    # ===== 確認出力 =====
    print("DB:", os.path.abspath(DB_FILE))
    print("\n--- Tables ---")
    for (name,) in cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
        print(name)

    print("\n--- Users ---")
    for row in cur.execute("SELECT id, account_number, name, balance FROM users ORDER BY id"):
        print(row)

    print("\n--- Request Links ---")
    for row in cur.execute("SELECT id, sender_id, amount, message, status, created_at FROM request_links"):
        print(row)

    conn.close()

if __name__ == "__main__":
    main()
