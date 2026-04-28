"""
app.py - Flask Backend for Email Spam Detector
===============================================
Provides REST API endpoints:
  GET  /health   → Returns server status
  POST /predict  → Classifies email as spam or ham

The model and vectorizer are loaded once at startup for efficiency.
"""

import os
import sys
import pickle
import logging
from flask import Flask, request, jsonify, render_template

# Ensure local modules are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from preprocessing import preprocess_text

# ─── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# ─── Flask App ────────────────────────────────────────────────────────────────
app = Flask(__name__)

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'spam_model.pkl')
TFIDF_PATH = os.path.join(BASE_DIR, 'model', 'tfidf_vectorizer.pkl')

# ─── Load Model at Startup ────────────────────────────────────────────────────
model      = None
vectorizer = None

def load_model():
    """Load the trained model and TF-IDF vectorizer from disk."""
    global model, vectorizer
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        with open(TFIDF_PATH, 'rb') as f:
            vectorizer = pickle.load(f)
        logger.info("✅ Model and vectorizer loaded successfully.")
    except FileNotFoundError as e:
        logger.error(f"❌ Model file not found: {e}")
        logger.error("Run train_model.py first to generate the model files.")

load_model()


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    """Serve the main frontend page."""
    return render_template('index.html')


@app.route('/health', methods=['GET'])
def health():
    """
    Health Check Endpoint
    ----------------------
    Returns server and model status.
    Frontend or monitoring tools can call this to verify the service is up.
    """
    status = {
        "status": "ok",
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None,
        "service": "Email Spam Detector API",
        "version": "1.0.0"
    }
    logger.info("Health check requested.")
    return jsonify(status), 200


@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediction Endpoint
    --------------------
    Accepts JSON: { "email": "<email text>" }
    Returns JSON: {
        "prediction": "spam" | "ham",
        "confidence": float,          # 0.0 to 1.0
        "is_spam": bool,
        "message": str
    }

    Processing pipeline:
    1. Validate input
    2. Preprocess text (lowercase, remove stopwords, etc.)
    3. Transform with TF-IDF vectorizer
    4. Predict with Logistic Regression
    5. Return structured JSON response
    """

    # ── Input validation ──────────────────────────────────────────────────────
    if not request.is_json:
        logger.warning("Request received without JSON content type.")
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    email_text = data.get('email', '').strip()

    if not email_text:
        logger.warning("Empty email text received.")
        return jsonify({"error": "Email text cannot be empty."}), 400

    if len(email_text) < 3:
        return jsonify({"error": "Email text is too short to classify."}), 400

    # ── Model not loaded guard ────────────────────────────────────────────────
    if model is None or vectorizer is None:
        logger.error("Prediction requested but model is not loaded.")
        return jsonify({"error": "Model not available. Please try again later."}), 503

    try:
        # ── Preprocessing ─────────────────────────────────────────────────────
        clean_text = preprocess_text(email_text)
        logger.info(f"Input: '{email_text[:60]}...' → Cleaned: '{clean_text[:60]}...'")

        # ── Vectorization ─────────────────────────────────────────────────────
        text_vector = vectorizer.transform([clean_text])

        # ── Prediction ────────────────────────────────────────────────────────
        prediction = model.predict(text_vector)[0]              # 0=ham, 1=spam
        probabilities = model.predict_proba(text_vector)[0]     # [p_ham, p_spam]

        label = "spam" if prediction == 1 else "ham"
        confidence = float(probabilities[prediction])           # confidence for predicted class

        logger.info(f"Prediction: {label.upper()} (confidence: {confidence:.2%})")

        return jsonify({
            "prediction": label,
            "confidence": round(confidence, 4),
            "confidence_pct": f"{confidence * 100:.1f}%",
            "is_spam": bool(prediction == 1),
            "message": (
                "⚠️ This email appears to be SPAM."
                if prediction == 1 else
                "✅ This email looks legitimate (Ham)."
            ),
            "processed_text_preview": clean_text[:100]
        }), 200

    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({"error": "An internal error occurred during prediction."}), 500


# ─── Error Handlers ───────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found."}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed."}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error."}), 500


# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    logger.info("🚀 Starting Email Spam Detector API...")
    app.run(debug=True, host='0.0.0.0', port=5001)
