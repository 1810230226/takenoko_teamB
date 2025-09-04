from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import os
import json
from datetime import datetime
import uuid
import json


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

# 請求リンクから送金（受け取り用）
@app.route("/api/claim-link", methods=["POST"])
def claim_link():
    data = request.get_json()
    link_id = data.get("link_id")
    receiver_num = data.get("receiver_num")  # ログイン中のユーザー
    message = data.get("message", "")

    if not link_id or not receiver_num:
        return jsonify({"error": "link_idとreceiver_numが必要です"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("BEGIN")  # トランザクション開始

        # 請求リンク情報取得
        cursor.execute("SELECT sender_id, amount, status FROM request_links WHERE id = ?", (link_id,))
        link_row = cursor.fetchone()
        if not link_row:
            return jsonify({"error": "リンクが存在しません"}), 404

        sender_id, amount, status = link_row
        if status == "Done":
            return jsonify({"error": "すでに受け取られています"}), 400

        # sender の残高確認
        cursor.execute("SELECT account_number, balance FROM users WHERE id = ?", (sender_id,))
        sender_row = cursor.fetchone()
        if not sender_row:
            return jsonify({"error": "送信者が存在しません"}), 404

        sender_account, sender_balance = sender_row
        if sender_balance < amount:
            return jsonify({"error": "送信者の残高不足"}), 400

        # receiver の残高確認
        cursor.execute("SELECT balance FROM users WHERE account_number = ?", (receiver_num,))
        receiver_row = cursor.fetchone()
        if not receiver_row:
            return jsonify({"error": "受取者が存在しません"}), 404

        # 残高更新
        cursor.execute("UPDATE users SET balance = balance - ? WHERE account_number = ?", (amount, sender_account))
        cursor.execute("UPDATE users SET balance = balance + ? WHERE account_number = ?", (amount, receiver_num))

        # 送金履歴に記録
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute(
            "INSERT INTO send_histories (sender_num, receiver_num, datetime, amount, message) VALUES (?, ?, ?, ?, ?)",
            (sender_account, receiver_num, now, amount, message)
        )

        # リンクステータス更新
        cursor.execute("UPDATE request_links SET status = 'Done' WHERE id = ?", (link_id,))

        conn.commit()
        return jsonify({"status": 0, "message": f"{amount}円を受け取りました", "amount": amount, "sender_num": sender_account})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()




@app.route("/api/request-links", methods=["POST"])
def create_request_link():
    data = request.get_json()
    sender_id = data.get("sender_id")
    amount = data.get("amount")
    message = data.get("message", None)

    if amount is None:
        return jsonify({"error": "Amount is required"}), 400
    if sender_id is None:
        return jsonify({"error": "Sender ID is required"}), 400

    link_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO request_links (id, sender_id, amount, message, created_at) VALUES (?, ?, ?, ?, ?)",
        (link_id, sender_id, amount, message, created_at)
    )
    print("リンク作成成功:", sender_id)
    conn.commit()
    conn.close()

    return jsonify({"id": link_id, "link": f"/link_login?id={link_id}"})


@app.route("/api/request-links/<link_id>", methods=["GET"])
def get_request_link(link_id):
    conn = get_db_connection()
    try:
        # request_links テーブルから link を取得
        row = conn.execute(
            "SELECT id, sender_id, amount, message FROM request_links WHERE id = ?",
            (link_id,)
        ).fetchone()
        if not row:
            return jsonify({"error": "Link not found"}), 404

        sender_id = row["sender_id"]

        # sender_id からユーザー情報を取得
        user_row = conn.execute(
            "SELECT id, name, account_number, balance FROM users WHERE id = ?",
            (sender_id,)
        ).fetchone()
        if not user_row:
            return jsonify({"error": "Sender not found"}), 404

        return jsonify({
            "id": row["id"],
            "amount": row["amount"],
            "message": row["message"],
            "sender": dict(user_row)  # 送金先ユーザー情報
        }), 200

    finally:
        conn.close()

# request_links と sender を結合して取得
@app.route("/api/request-links/<link_id>/recipient", methods=["GET"])
def get_request_link_recipient(link_id):
    conn = get_db_connection()
    try:
        # link_id から request_links レコードを取得
        link_row = conn.execute(
            "SELECT sender_id, amount FROM request_links WHERE id = ?",
            (link_id,)
        ).fetchone()

        if not link_row:
            return jsonify({"error": "Link not found"}), 404

        sender_id = link_row["sender_id"]
        amount = link_row["amount"]

        # sender_id からユーザー情報を取得
        sender_row = conn.execute(
            "SELECT id, account_number, name, balance FROM users WHERE id = ?",
            (sender_id,)
        ).fetchone()

        if not sender_row:
            return jsonify({"error": "Sender user not found"}), 404

        # JSON で返す
        return jsonify({
            "recipient": {
                "id": sender_row["id"],
                "account_number": sender_row["account_number"],
                "name": sender_row["name"],
                "balance": sender_row["balance"]
            },
            "amount": amount
        })
    finally:
        conn.close()

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



if __name__ == "__main__":
    app.run(port=5001, debug=True)
