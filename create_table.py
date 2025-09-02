import sqlite3
from datetime import datetime
import uuid

conn = sqlite3.connect("takenoko.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    account_number TEXT,
    name TEXT,
    balance INTEGER
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS request_links (
    id TEXT PRIMARY KEY,
    sender_id INTEGER,
    amount INTEGER NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'created',
    created_at TEXT,
    FOREIGN KEY (sender_id) REFERENCES users(id)
)
""")

# 6人分の初期データ
users = [
    (1, "0123456", "佐藤 太郎", 150000),
    (2, "1234567", "鈴木 花子", 120000),
    (3, "2345678", "高橋 次郎", 200000),
    (4, "3456789", "田中 三郎", 80000),
    (5, "4567890", "伊藤 美咲", 50000),
    (6, "5678901", "渡辺 健一", 175000),
]

# INSERT OR IGNORE → idが重複する場合は無視される
cursor.executemany("INSERT OR IGNORE INTO users (id, account_number, name, balance) VALUES (?, ?, ?, ?)", users)


# ----------------- 新しいrequest_linksテーブル作成 -----------------
print("Creating request_links table...")
cursor.execute("""
CREATE TABLE IF NOT EXISTS request_links (
    id TEXT PRIMARY KEY,
    sender_id INTEGER,
    amount INTEGER NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'created',
    created_at TEXT,
    FOREIGN KEY (sender_id) REFERENCES users(id)
)
""")

# 実際のアプリケーションでは、API経由で動的にデータが追加されます
# ----------------- 新しいテーブルへの初期データ挿入 -----------------
link_id = str(uuid.uuid4())
current_time = datetime.now().isoformat()

# request_linksはタプルを要素に持つリスト
request_links = [
    (link_id, 1, 15000, "ランチ代です", "created", current_time),
]

# ここを修正: cursor.execute() を cursor.executemany() に変更する
cursor.executemany("INSERT OR IGNORE INTO request_links (id, sender_id, amount, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", request_links)

conn.commit()

# 挿入確認
for row in cursor.execute("SELECT account_number, name FROM users"):
    print(row)

print("\n--- Users ---")
for row in cursor.execute("SELECT account_number, name FROM users"):
    print(row)

print("\n--- Request Links ---")
for row in cursor.execute("SELECT id, sender_id, amount, message, status, created_at FROM request_links"):
    print(row)

conn.close()