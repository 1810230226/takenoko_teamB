from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import os
import json
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
            return jsonify({"status": 1, "message": "Sender not exsist."}), 400
        if sender_row[0] < amount:
            return jsonify({"status": 1, "message": "Insufficient balance."}), 400
        # 受金者の存在確認
        cursor.execute("SELECT balance FROM users WHERE account_number = ?", (receiver_num,))
        receiver_row = cursor.fetchone()
        if receiver_row is None:
            return jsonify({"status": 1, "message": "Receiver not exsist."}), 400
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

##### 追加箇所(太平) #####

# 請求状況の確認
"""
@app.route("/api/claim_state/<int:link_id>", method=["GET"])
def claim_state(link_id):
    conn = get_db_connection() 
    state = conn.execute("SELECT state FROM links WHERE id = ?", (link_id,)).fetchone() 
    conn.close() 
    return jsonify({"state": state[0]})
"""
def get_claim_state_from_db(link_id):
    conn = get_db_connection()
    state = conn.execute("SELECT status FROM links WHERE id = ?", (link_id,)).fetchone()
    conn.close()
    return state[0] if state else None


# APIエンドポイント
@app.route("/api/claim_state/<int:link_id>", methods=["GET"])
def claim_state(link_id):
    state = get_claim_state_from_db(link_id)
    return jsonify({"state": state})


# 請求リンクから送金
@app.route("/api/link_sendmoney", methods=["POST"])
def link_send_money():
    data = request.get_json()
    link_id = data.get("link_id")
    amount = data.get("amount")
    sender_num = data.get("sender_num")
    receiver_num = data.get("reciever_num")
    message = data.get("message", "")

    current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 請求状況の確認
    link_state = get_claim_state_from_db(link_id)
    if link_state == "Done": # 請求済み
        return jsonify({"status": 1, "message": "Link state is done."}), 400
    if link_state == "Expired": # 期限切れ
        return jsonify({"status": 1, "message": "Link state is expired."}), 400
    
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
        #if receiver_row is None:
            #return jsonify({"status": 1, "message": "受金者が存在しません"}), 400
        
        # 送金処理
        cursor.execute("UPDATE users SET balance = balance - ? WHERE account_number = ?", (amount, sender_num))
        cursor.execute("UPDATE users SET balance = balance + ? WHERE account_number = ?", (amount, receiver_num))
        conn.execute(
            "INSERT INTO send_histories (sender_num, receiver_num, datetime, amount, message) VALUES (?, ?, ?, ?, ?)",
            (sender_num, receiver_num, current_date, amount, message)
        )

        # 請求状態の書き換え
        cursor.execute("UPDATE links SET status = ? WHERE id = ?", ("Done", link_id))

        conn.commit()  # コミット
        return jsonify({"status": 0, "message": f"{sender_num}から{receiver_num}へ{amount}円送金完了"})

    except Exception as e:
        conn.rollback()
        return jsonify({"status": -1, "message": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


# 対象ユーザーの履歴取得
@app.route("/api/get_history/<user_num>", methods=["GET"])
def get_history(user_num): 
    conn = get_db_connection() 
    cursor = conn.cursor() 
    # 対象ユーザーの履歴を取得 
    # 送金側
    send_history = cursor.execute("SELECT receiver_num, datetime, amount, message FROM send_histories WHERE sender_num = ?", (user_num,)).fetchall()
    send_history = [tuple(row) + (1,) for row in send_history] # send: flag=1
    # 請求側
    receive_history = cursor.execute("SELECT sender_num, datetime, amount, message FROM send_histories WHERE receiver_num = ?", (user_num,)).fetchall()
    receive_history = [tuple(row) + (0,) for row in receive_history] # receive: flag=0
    user_history = send_history + receive_history
    # 戻り値のリストを作成(行:取引数, 列: send_historiesのカラム長)
    return_list = [[0 for _ in range(len(user_history[0]))] for _ in range(len(user_history))]

    for i in range(len(user_history)):
        row = user_history[i]
        for j in range(len(row)):
            return_list[i][j] = row[j]

        if return_list[i][-1] == "send":  # 送金側: 請求側の口座番号を氏名に変更
            receiver_name = cursor.execute(
                "SELECT name FROM users WHERE account_number = ?", (row[1],)
            ).fetchone()
            return_list[i][0] = receiver_name[0]
        else:  # 請求側: 送金側の口座番号を氏名に変更
            sender_name = cursor.execute(
                "SELECT name FROM users WHERE account_number = ?", (row[0],)
            ).fetchone()
            return_list[i][0] = sender_name[0]

    # datetime列（index=1）を基準にソート
    return_list.sort(
        key=lambda r: datetime.strptime(r[1], "%Y-%m-%d %H:%M:%S")
    )

    # JSON返却用に datetime を文字列に戻す
    formatted_list = []
    for row in return_list:
        row_copy = row[:]  # 元データを壊さないようコピー
        row_copy[1] = datetime.strptime(row[1], "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")
        formatted_list.append(row_copy)

    return Response(
        json.dumps(formatted_list, ensure_ascii=False),
        mimetype="application/json"
    )



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

@app.route("/api/request-links/<link_id>", methods=["GET"])
def get_request_link(link_id):
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT amount FROM request_links WHERE id = ?",
            (link_id,)
        ).fetchone()  # ← これでOK（Rowを返す）

        if not row:
            return jsonify({"error": "Link not found"}), 404

        return jsonify({"amount": row["amount"]}), 200
    finally:
        conn.close()

@app.route("/api/link-login", methods=["POST"])
def login():
    data = request.get_json()
    account_number = data.get("account_number")
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE account_number = ?", (account_number,)).fetchone()
    conn.close()

    if user is None:
        return jsonify({"error": "口座番号が存在しません"}), 404

    return jsonify(dict(user))


if __name__ == "__main__":
    app.run(port=5001, debug=True)
