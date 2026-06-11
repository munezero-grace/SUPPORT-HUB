import os
from dotenv import load_dotenv

load_dotenv()

# Coefficients that map predict_proba() → component scores.
# Each key is a priority class; the value is its contribution weight.
# Tunable without retraining — restart Flask to apply changes.
SCORE_COEFFICIENTS = {
    "sentiment":   {"critical": 1.00, "high": 1.00, "medium": 0.00, "low": 0.00},
    "complexity":  {"critical": 0.80, "high": 0.50, "medium": 0.20, "low": 0.00},
    "ai_priority": {"critical": 1.00, "high": 0.75, "medium": 0.25, "low": 0.00},
}

# Aging is deterministic — hours open / cap → 0..1
MAX_AGE_HOURS = int(os.getenv("MAX_AGE_HOURS", 72))

# UI threshold: confidence below this shows the Triage badge
TRIAGE_CONFIDENCE_THRESHOLD = float(os.getenv("TRIAGE_CONFIDENCE_THRESHOLD", 0.80))

MODEL_DIR  = os.getenv("MODEL_DIR", "models")
PORT       = int(os.getenv("PORT", 8000))
HOST       = os.getenv("HOST", "0.0.0.0")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL   = "llama-3.3-70b-versatile"
