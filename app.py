from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
import uuid

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
CORS(app)

DB_FILE = os.path.join(app.root_path, "takenoko.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/api/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users").fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])

@app.route("/api/users", methods=["POST"])
def add_user():
    data = request.get_json()  # React から送られるJSON
    name = data["name"]
    balance = data.get("balance", 0)
    account_number = data["account_number"]

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO users (name, balance, account) VALUES (?, ?, ?)",
        (name, balance, account_number)
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "ユーザーを追加しました！"})

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



if __name__ == "__main__":
    app.run(port=5001, debug=True)
