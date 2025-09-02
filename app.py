from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

DB_FILE = os.path.join(app.root_path, "takenoko.db")

def get_db_connection():
    conn = sqlite3.connect("takenoko.db")
    conn.row_factory = sqlite3.Row
    return conn



##### 送金処理 #####
@app.route("/api/sendmoney", methods=["POST"])
def send_money():
    data = request.get_json()
    amount = data.get("amount")
    sender_num = data.get("sender_num")
    receiver_num = data.get("reciever_num")
    message = data.get("message", "")

    current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

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

        conn.execute(
            "INSERT INTO send_histories (sender_num, receiver_num, datetime, amount, message) VALUES (?, ?, ?, ?, ?)",
            (sender_num, receiver_num, current_date, amount, message)
        )

        conn.commit()  # コミット

        return jsonify({"status": 0, "message": f"{sender_num}から{receiver_num}へ{amount}円送金完了"})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": -1, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])

@app.route("/api/login", methods=["POST"])
def login():
    print("aaaa")
    data = request.get_json()
    account_number = data.get("account_number")

    print(account_number)
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE account_number = ?", (account_number,)).fetchone()
    conn.close()

    if user is None:
        return jsonify({"error": "口座番号が存在しません"}), 404

    return jsonify(dict(user))

# 指定したidのユーザの情報をとる
@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(user))

@app.route("/api/send_history", methods=["POST"])
def add_send_history():
    """
    送金履歴を追加するAPIエンドポイント
    """
    try:
        data = request.get_json()
        server_id = data.get("server_id")
        reciever_id = data.get("reciever_id")
        amount = data.get("amount")
        message = data.get("message", "")

        if not all([server_id, reciever_id, amount]):
            return jsonify({"status": "error", "message": "送金元ID, 送金先ID, 金額は必須です。"}), 400

        current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        conn = get_db_connection()
        conn.execute(
            "INSERT INTO send_history (server_id, reciever_id, date, amount, message) VALUES (?, ?, ?, ?, ?)",
            (server_id, reciever_id, current_date, amount, message)
        )
        conn.commit()
        conn.close()

        return jsonify({"status": "success", "message": "送信履歴を追加しました！"})

    except KeyError as e:
        return jsonify({"status": "error", "message": f"必須フィールドがありません: {e}"}), 400
    except sqlite3.Error as e:
        return jsonify({"status": "error", "message": f"データベースエラー: {e}"}), 500
    except Exception as e:
        return jsonify({"status": "error", "message": f"予期せぬエラーが発生しました: {e}"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
