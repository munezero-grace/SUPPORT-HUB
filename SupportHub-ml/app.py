from flask import Flask, request, jsonify
from flask_cors import CORS
import config
from src.predictor import get_predictor

app = Flask(__name__)
CORS(app)

predictor = get_predictor()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_ready": predictor.is_ready,
        "model_dir": config.MODEL_DIR,
    })


@app.route("/score", methods=["POST"])
def score():
    data = request.get_json(force=True, silent=True) or {}
    title = data.get("title", "")
    description = data.get("description")
    created_at = data.get("created_at")

    if not title:
        return jsonify({"error": "title is required"}), 400

    result = predictor.predict(title, description, created_at)
    return jsonify(result)


@app.route("/score/batch", methods=["POST"])
def score_batch():
    data = request.get_json(force=True, silent=True)
    if not isinstance(data, list):
        return jsonify({"error": "Request body must be a JSON array"}), 400

    results = []
    for item in data:
        ticket_id = item.get("id")
        title = item.get("title", "")
        description = item.get("description")
        created_at = item.get("created_at")
        result = predictor.predict(title, description, created_at)
        result["id"] = ticket_id
        results.append(result)

    return jsonify(results)


if __name__ == "__main__":
    app.run(host=config.HOST, port=config.PORT, debug=False)
