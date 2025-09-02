from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect("takenoko.db")
    conn.row_factory = sqlite3.Row
    return conn

'''
# ユーザー一覧取得
@app.route("/sendmoney", methods=["GET"])
def get_users():
    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])
'''

##### 送金処理 #####
@app.route("/api/sendmoney", methods=["POST"])
def send_money():
    data = request.get_json()
    amount = data.get("amount")
    sender_num = data.get("sender_num")
    receiver_num = data.get("reciever_num")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("BEGIN")  # トランザクション開始

        # 送金者の残高確認
        cursor.execute("SELECT balance FROM users WHERE account_number = ?", (sender_num,))
        sender_row = cursor.fetchone()
        if sender_row is None:
            return jsonify({"status": 1, "message": "送金者が存在しません"}), 400
        if sender_row[0] < amount:
            return jsonify({"status": 1, "message": "残高不足"}), 400

        # 受金者の存在確認
        cursor.execute("SELECT balance FROM users WHERE account_number = ?", (receiver_num,))
        receiver_row = cursor.fetchone()
        if receiver_row is None:
            return jsonify({"status": 1, "message": "受金者が存在しません"}), 400

        # 送金処理
        cursor.execute("UPDATE users SET balance = balance - ? WHERE account_number = ?", (amount, sender_num))
        cursor.execute("UPDATE users SET balance = balance + ? WHERE account_number = ?", (amount, receiver_num))

        conn.commit()  # コミット

        return jsonify({"status": 0, "message": f"{sender_num}から{receiver_num}へ{amount}円送金完了"})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": -1, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(port=5000, debug=True)

'''
##### 送信先一覧表示 #####
@app.route("/get_user", methods=["POST"])
def get_user():
    data = request.get_json()
    sender_num = data.get("sender_num")

    conn = get_db_connection()
    cursor = conn.cursor()

    users_dict = {}  # 結果を格納する辞書

    for row in cursor.execute("SELECT account_number, name FROM users"):
        account_number = row["account_number"]
        name = row["name"]

        if account_number == sender_num:
            continue  # 除外

        # 辞書に追加
        users_dict[account_number] = name

    cursor.close()
    conn.close()

    return jsonify(users_dict)
'''









