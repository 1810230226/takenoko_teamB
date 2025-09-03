from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import os
from datetime import datetime
import uuid

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
CORS(app)

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



@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    account_number = data.get("account_number")
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE account_number = ?", (account_number,)).fetchone()
    conn.close()

    if user is None:
        return jsonify({"error": "口座番号が存在しません"}), 404

    return jsonify(dict(user))


@app.route("/api/users", methods=["GET"])
def get_users():
    print("okk")
    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    print([user for user in users])
    return jsonify([dict(user) for user in users])



# 指定したidのユーザの情報をとる
@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(user))


@app.route("/api/request-links", methods=["POST"])
def create_request_link():
    data = request.get_json()
    sender_id = data.get("sender_id")
    amount = data.get("amount")
    message = data.get("message", None)

    if amount is None:
        return jsonify({"error": "Amount is required"}), 400

    link_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO request_links (id, sender_id, amount, message, created_at) VALUES (?, ?, ?, ?, ?)",
        (link_id, sender_id, amount, message, created_at)
    )
    conn.commit()
    conn.close()

<<<<<<< HEAD
    return jsonify({"id": link_id, "link": f"/link_login?id={link_id}"})


# @app.route("/api/request_links/<link_id>", methods=["GET"])
# def get_request_link(link_id):
#     cur = get_db().cursor()
#     cur.execute("SELECT * FROM request_links WHERE id = ?", (link_id,))
#     row = cur.fetchone()
#     if row:
#         return jsonify({
#             "id": row["id"],
#             "sender_id": row["sender_id"],
#             "amount": row["amount"],
#             "message": row["message"],
#             "status": row["status"],
#             "created_at": row["created_at"]
#         })
#     else:
#         return jsonify({"error": "Link not found"}), 404

@app.route("/api/request_links/<link_id>", methods=["GET"])
def get_request_link(link_id):
    """
    指定されたリンクIDに対応する請求金額を取得するAPIエンドポイント。
    """
    cur = get_db().cursor()
    
    # idに基づいてamount列のみを取得
    cur.execute("SELECT amount FROM request_links WHERE id = ?", (link_id,))
    row = cur.fetchone()
    
    if row:
        # amountが見つかった場合、JSON形式で返す
        return jsonify({
            "amount": row["amount"]
        })
    else:
        # amountが見つからない場合、404エラーを返す
        return jsonify({"error": "Link not found"}), 404

=======
    return jsonify({"id": link_id, "link": f"/send?id={link_id}"})
>>>>>>> ae8d575111e3f4b4fdd4dd9e10b147e5d38c04e3


if __name__ == "__main__":
    app.run(port=5001, debug=True)
<<<<<<< HEAD
=======

>>>>>>> ae8d575111e3f4b4fdd4dd9e10b147e5d38c04e3
