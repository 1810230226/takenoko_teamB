import sqlite3

conn = sqlite3.connect("takenoko.db")
cursor = conn.cursor()

##### ユーザーテーブル作成 #####
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


##### 送金履歴テーブル作成 #####
cursor.execute("DROP TABLE IF EXISTS send_histories")  # 既存テーブル削除(実行時するたびにusersテーブルを初期化)
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

##### リンクテーブル作成 #####
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


##### リクエストリンクテーブル作成 #####
cursor.execute("DROP TABLE IF EXISTS request_links")
cursor.execute("""
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

# ユーザーの初期データ
users = [
    (1, "0123456", "広末 涼子", 150000, "/assets/images/icons/human1.png"),
    (2, "1234567", "国分 太一", 1200000, "/assets/images/icons/human2.png"),
    (3, "2345678", "永野 芽郁", 200000, "/assets/images/icons/human3.png"),
    (4, "3456789", "田中 圭", 80000, "/assets/images/icons/human4.png"),
    (5, "4567890", "水原 一平", 50000, "/assets/images/icons/human5.png"),
    (6, "5678901", "中居 正広", 175000, "/assets/images/icons/human6.png"),
]

# 履歴の初期データ
send_histories = [
    (1, "0123456", "1234567", "2025-09-02 20:10:25", 3000, "飲み代"),
    (2, "0123456", "1234567", "2025-09-02 20:15:25", 200, "ジュース代"),
    (3, "1234567", "0123456", "2025-09-02 20:25:25", 30000, "旅行代"),
    (4, "1234567", "0123456", "2025-09-02 20:35:25", 10000, "お年玉"),
]

# リンクの初期データ
links = [
    (1, "0123456", "1234567", "2025-09-02 20:15:25", 500, "お昼代", "Before"),
    (2, "1234567", "0123456", "2025-09-03 09:30:12", 1000, "ガソリン代", "Before"),
    (3, "0123456", "1234567", "2025-09-04 10:50:20", 10000, "宿代", "After")
]

request_links = [

]


# INSERT OR IGNORE → idが重複する場合は無視される
cursor.executemany("INSERT OR IGNORE INTO users (id, account_number, name, balance, icon_pass) VALUES (?, ?, ?, ?, ?)", users)

cursor.executemany("INSERT OR IGNORE INTO send_histories (id, sender_num, receiver_num, datetime, amount, message) VALUES (?, ?, ?, ?, ?, ?)", send_histories)

cursor.executemany("INSERT OR IGNORE INTO links (id, sender_num, receiver_num, datetime, amount, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)", links)

conn.commit()


# データベースからデータの取得・出力
print("users:")
for row in cursor.execute("SELECT * FROM users"):
    print(row)
print()


print("send_histories:")
for row in cursor.execute("SELECT * FROM send_histories"):
    print(row)
print()


print("links:")
for row in cursor.execute("SELECT * FROM links"):
    print(row)
print()


print("request_links:")
for row in cursor.execute("SELECT * FROM request_links"):
    print(row)
print()


cursor.close()
conn.close()
