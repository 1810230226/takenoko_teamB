import sqlite3

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

conn.commit()

for row in cursor.execute("SELECT * FROM users"):
    print(row)


conn.close()