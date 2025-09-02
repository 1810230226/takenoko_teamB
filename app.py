from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect("app.db")
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
    account = data["account"]

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO users (name, balance, account) VALUES (?, ?, ?)",
        (name, balance, account)
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "success", "message": "ユーザーを追加しました！"})
