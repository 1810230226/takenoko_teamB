from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

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

# 指定したidのユーザの情報をとる
@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(dict(user))
