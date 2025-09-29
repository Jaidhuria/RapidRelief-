from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO

# Gemini API integration
from dotenv import load_dotenv
import os
import sys
import requests
from datetime import datetime

load_dotenv()
# Accept both GEMINI_API_KEY and OPENAI_API_KEY for flexibility
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

# Resolve paths
BASE_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, os.pardir))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
ASSETS_DIR = os.path.join(PROJECT_ROOT, "assets")

# Import local backend db module (same directory)
import db  # type: ignore

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def home():
    # Default to main frontend
    try:
        return send_from_directory(FRONTEND_DIR, 'main.html')
    except Exception:
        return render_template('chatbot.html')

@app.route('/ngo')
def ngo_page():
    return send_from_directory(FRONTEND_DIR, 'ngo.html')

@app.route('/frontend/<path:filename>')
def frontend_static(filename):
    return send_from_directory(FRONTEND_DIR, filename)

@app.route('/assets/<path:filename>')
def assets_static(filename):
    return send_from_directory(ASSETS_DIR, filename)

# Friendly routes for common pages
@app.route('/login')
def login_page():
    return send_from_directory(FRONTEND_DIR, 'login.html')

@app.route('/emergency')
def emergency_page():
    return send_from_directory(FRONTEND_DIR, 'emergency.html')

# Catch-all to serve any existing file under frontend (e.g., /login.html, /ngo.html)
@app.route('/<path:path>')
def frontend_catch_all(path):
    target = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(target):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'main.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # If no API key configured, use a local keyword-based fallback
        if not GEMINI_API_KEY:
            text = user_message.lower()
            reply = None
            # Simple disaster FAQs
            if any(k in text for k in ["flood", "floods", "flooding"]):
                reply = (
                    "Flood safety tips: Move to higher ground, avoid walking/driving through flood water, "
                    "disconnect electricity if safe, boil water before drinking, and listen to authorities. "
                    "Emergency numbers: Police 100, Fire 101, Ambulance 102, NDMA 1078."
                )
            elif any(k in text for k in ["earthquake", "quake", "tremor"]):
                reply = (
                    "Earthquake safety: Drop, Cover, and Hold On. Stay away from windows, "
                    "if outdoors move to open area, avoid elevators, check for gas leaks afterwards."
                )
            elif any(k in text for k in ["cyclone", "hurricane", "storm", "typhoon"]):
                reply = (
                    "Cyclone prep: Secure windows/doors, stock water/food/meds/flashlight, charge phones, "
                    "move to a safe shelter if advised, avoid coastal areas."
                )
            elif any(k in text for k in ["landslide", "mudslide"]):
                reply = (
                    "Landslide safety: Evacuate steep slopes, watch for cracks/tilting trees, "
                    "stay alert during heavy rain, avoid river valleys and landslide paths."
                )
            elif any(k in text for k in ["drought", "heatwave", "heat wave", "heat"]):
                reply = (
                    "Heat wave tips: Stay hydrated, avoid midday sun, wear light clothing, "
                    "check on elderly and children, never leave anyone in parked cars."
                )
            elif any(k in text for k in ["emergency", "help", "sos", "urgent"]):
                reply = (
                    "If this is an emergency, call your local services now: Police 100, Fire 101, Ambulance 102. "
                    "Share your location and details clearly."
                )
            elif any(k in text for k in ["contact", "number", "helpline"]):
                reply = (
                    "Emergency contacts in India: Police 100, Fire 101, Ambulance 102, NDMA 1078."
                )
            else:
                reply = (
                    "I'm a disaster assistant. Ask about floods, earthquakes, cyclones, landslides, heat waves, "
                    "or say 'emergency' to get critical numbers."
                )
            return jsonify({"reply": reply})

        # Online mode: call Gemini API with a stable default model
        # Prefer the standard chat-capable model; skip expensive model listing
        model_name = "models/gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": user_message}]}]}
        response = requests.post(url, headers=headers, params={"key": GEMINI_API_KEY}, json=payload, timeout=20)
        if response.status_code != 200:
            print("Gemini API error:", response.text)
            # Fallback graceful message
            return jsonify({"reply": "AI service is currently unavailable. Ask me about disaster safety tips or use emergency numbers: Police 100, Fire 101, Ambulance 102."}), 200
        result = response.json()
        bot_reply = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Sorry, I didn’t understand that.")
        return jsonify({"reply": bot_reply})
    except Exception as e:
        print("Chatbot error:", e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/emergency', methods=['POST'])
def emergency_alert():
    try:
        data = request.json
        service = data.get('service', '')
        location = data.get('location', '')
        details = data.get('details', '')
        
        print(f"EMERGENCY ALERT: {service} needed at {location}. Details: {details}")
        
        return jsonify({
            'status': 'alert_sent',
            'message': f'Emergency services ({service}) have been notified',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- API: NGOs ---
@app.route("/api/ngos", methods=["GET"])
def list_ngos():
    conn = db.get_connection()
    ngos = conn.execute("SELECT * FROM ngos").fetchall()
    conn.close()
    return jsonify([dict(x) for x in ngos])

@app.route("/api/ngos", methods=["POST"])
def create_ngo():
    data = request.json
    ngo_id = db.new_id()
    conn = db.get_connection()
    conn.execute(
        "INSERT INTO ngos (id, name, state, contact_person, phone, email, registration_number, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            ngo_id,
            data.get("name"),
            data.get("state"),
            data.get("contact_person"),
            data.get("phone"),
            data.get("email"),
            data.get("registration_number"),
            data.get("latitude"),
            data.get("longitude"),
        ),
    )
    conn.commit()
    conn.close()
    socketio.emit("ngos:updated")
    return jsonify({"id": ngo_id}), 201

# --- API: Help Requests ---
@app.route("/api/help-requests", methods=["GET"])
def list_requests():
    conn = db.get_connection()
    reqs = conn.execute("SELECT * FROM help_requests WHERE status='open'").fetchall()
    conn.close()
    return jsonify([dict(x) for x in reqs])

@app.route("/api/help-requests", methods=["POST"])
def create_request():
    data = request.json
    req_id = db.new_id()
    conn = db.get_connection()
    conn.execute(
        "INSERT INTO help_requests (id, ngo_id, location, lat, lng, need, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            req_id,
            data.get("ngo_id"),
            data.get("location"),
            data.get("lat"),
            data.get("lng"),
            data.get("need"),
            data.get("priority"),
        ),
    )
    conn.commit()
    conn.close()
    socketio.emit("help:updated")
    return jsonify({"id": req_id}), 201

@app.route("/api/help-requests/<rid>/status", methods=["POST"])
def update_request_status(rid):
    status = request.json.get("status")
    conn = db.get_connection()
    conn.execute("UPDATE help_requests SET status=? WHERE id=?", (status, rid))
    conn.commit()
    conn.close()
    socketio.emit("help:updated")
    return jsonify({"status": "ok"})

# --- API: Supplies ---
@app.route("/api/supplies", methods=["GET"])
def list_supplies():
    conn = db.get_connection()
    rows = conn.execute("SELECT * FROM supplies").fetchall()
    conn.close()
    return jsonify([dict(x) for x in rows])

@app.route("/api/supplies", methods=["POST"])
def add_supply():
    data = request.json
    sid = db.new_id()
    conn = db.get_connection()
    conn.execute(
        "INSERT INTO supplies (id, item, quantity, status) VALUES (?, ?, ?, ?)",
        (sid, data.get("item"), data.get("quantity"), data.get("status")),
    )
    conn.commit()
    conn.close()
    socketio.emit("supplies:updated")
    return jsonify({"id": sid}), 201

if __name__ == '__main__':
    # Initialize DB schema if needed
    try:
        db.init_db()
    except Exception as e:
        print("DB init warning:", e)
    socketio.run(app, debug=True, port=5000)