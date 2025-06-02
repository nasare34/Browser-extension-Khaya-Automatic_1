import os
import logging
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for allowing browser extension to communicate
CORS(app)

# Configuration
app.config["KHAYA_API_URL"] = "https://translation-api.ghananlp.org/v1/translate"
app.config["KHAYA_API_KEY"] = "7026a50f018e47eaaba5b21d26e17bbc"

# Supported Languages
LANGUAGES = {
    "en": "English", "tw": "Twi", "ee": "Ewe", "gaa": "Ga", "fat": "Fante",
    "yo": "Yoruba", "dag": "Dagbani", "ki": "Kikuyu", "gur": "Gurune",
    "luo": "Luo", "mer": "Kimeru", "kus": "Kusaal"
}

@app.route("/api/translate-snippet", methods=["POST"])
def translate_snippet():
    """API endpoint for translating selected text"""
    data = request.get_json()
    text = data.get("text")
    source_lang = data.get("source_language")
    target_lang = data.get("target_language")

    # Validate languages
    if source_lang not in LANGUAGES or target_lang not in LANGUAGES:
        return jsonify({"error": "Invalid language selection."}), 400

    headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": app.config["KHAYA_API_KEY"]
    }
    payload = {
        "text": text,
        "source_language": source_lang,
        "target_language": target_lang
    }

    try:
        response = requests.post(app.config["KHAYA_API_URL"], json=payload, headers=headers)
        if response.status_code == 200:
            return jsonify({"translated_text": response.json().get("message", "")})
        return jsonify({"error": "Translation failed", "details": response.text}), 500
    except Exception as e:
        logging.error(f"Error: {e}")
        return jsonify({"error": "Exception occurred", "details": str(e)}), 500

@app.route("/")
def index():
    return "🚀 Khaya translation API is up and running!"


if __name__ == "__main__":
    app.run(debug=True)
