import sqlite3

conn = sqlite3.connect("takenoko.db")
cursor = conn.cursor()

##### 送金履歴テーブル #####

cursor.execute("""
CREATE TABLE IF NOT EXISTS send_histories (
    id INTEGER PRIMARY KEY,
    sender_num TEXT,
    receiver_num TEXT,
    datetime TEXT,
    amount INTEGER,
    message TEXT
)
""")

##### ユーザーテーブル #####
# ユーザーのアイコンパスを追加
cursor.execute("DROP TABLE IF EXISTS users")  # 既存テーブル削除(実行時するたびにusersテーブルを初期化)
cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    account_number INTEGER,
    name TEXT,
    balance INTEGER,
    icon_pass TEXT
)
""")

# 6人分の初期データ
users = [
    (1, "0123456", "広末 涼子", 150000, "/assets/images/icons/human1.png"),
    (2, "1234567", "国分 太一", 1200000, "/assets/images/icons/human2.png"),
    (3, "2345678", "永野 芽郁", 200000, "/assets/images/icons/human3.png"),
    (4, "3456789", "田中 圭", 80000, "/assets/images/icons/human4.png"),
    (5, "4567890", "水原 一平", 50000, "/assets/images/icons/human5.png"),
    (6, "5678901", "中居 正広", 175000, "/assets/images/icons/human6.png"),
]

# INSERT OR IGNORE → idが重複する場合は無視される
cursor.executemany("INSERT INTO users (id, account_number, name, balance, icon_pass) VALUES (?, ?, ?, ?, ?)", users)

conn.commit()

for row in cursor.execute("SELECT * FROM users"):
    print(row)

print()

for row in cursor.execute("SELECT * FROM send_histories"):
    print(row)
print()

cursor.execute("DROP TABLE IF EXISTS links")
cursor.execute("""
CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY,
    sender_num TEXT,
    receiver_num TEXT,
    datetime TEXT,
    amount INTEGER,
    message TEXT,
    status TEXT
)
""")

link = (1, "0123456", "1234567", "2025-09-02 20:15:25", 500, "単体テスト", "Before")
cursor.execute("INSERT INTO links (id, sender_num, receiver_num, datetime, amount, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)", link)
for row in cursor.execute("SELECT * FROM links"):
    print(row)

cursor.close()
conn.close()
