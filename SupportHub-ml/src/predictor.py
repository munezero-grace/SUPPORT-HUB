import os
import joblib
import numpy as np
from datetime import datetime, timezone
from typing import Optional
import config
from src.preprocessing import preprocess_text


def _derive_scores(proba: np.ndarray, classes: np.ndarray) -> tuple[float, float, float]:
    """
    Derive component scores from the classifier's probability vector.
    Returns (sentiment_score, complexity_score, ai_priority_score).
    """
    p = {cls: float(proba[i]) for i, cls in enumerate(classes)}
    coeffs = config.SCORE_COEFFICIENTS

    sentiment = sum(p.get(cls, 0.0) * w for cls, w in coeffs["sentiment"].items())
    complexity = sum(p.get(cls, 0.0) * w for cls, w in coeffs["complexity"].items())
    ai_priority = sum(p.get(cls, 0.0) * w for cls, w in coeffs["ai_priority"].items())

    return float(np.clip(sentiment, 0.0, 1.0)), float(np.clip(complexity, 0.0, 1.0)), float(np.clip(ai_priority, 0.0, 1.0))


def _build_reasoning(priority: str, sentiment: float, complexity: float, aging: float) -> str:
    urgency = (
        "critical urgency" if sentiment > 0.80 else
        "high urgency"     if sentiment > 0.55 else
        "moderate urgency" if sentiment > 0.30 else
        "low urgency"
    )
    tech = (
        "high technical complexity"      if complexity > 0.60 else
        "moderate technical complexity"  if complexity > 0.30 else
        "low technical complexity"
    )
    age = f"aged {aging:.0%} of {config.MAX_AGE_HOURS}h threshold"
    return f"{urgency.capitalize()} ({sentiment:.0%}); {tech} ({complexity:.0%}); {age}."


class Predictor:
    def __init__(self):
        self._vectorizer = None
        self._priority_model = None
        self._ready = False

    def _load(self):
        vpath = os.path.join(config.MODEL_DIR, "vectorizer.pkl")
        mpath = os.path.join(config.MODEL_DIR, "priority_model.pkl")
        if not os.path.exists(vpath) or not os.path.exists(mpath):
            return
        self._vectorizer = joblib.load(vpath)
        self._priority_model = joblib.load(mpath)
        self._ready = True

    @property
    def is_ready(self) -> bool:
        if not self._ready:
            self._load()
        return self._ready

    def _compute_aging(self, created_at: Optional[str]) -> float:
        if not created_at:
            return 0.0
        try:
            if created_at.endswith("Z"):
                created_at = created_at[:-1] + "+00:00"
            dt = datetime.fromisoformat(created_at)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            hours_elapsed = (datetime.now(timezone.utc) - dt).total_seconds() / 3600
            return min(1.0, hours_elapsed / config.MAX_AGE_HOURS)
        except Exception:
            return 0.0

    def predict(self, title: str, description: Optional[str], created_at: Optional[str]) -> dict:
        if not self.is_ready:
            return self._fallback(created_at)

        text = preprocess_text(title, description)
        X = self._vectorizer.transform([text])

        proba = self._priority_model.predict_proba(X)[0]
        classes = self._priority_model.classes_
        priority_idx = int(np.argmax(proba))
        priority = classes[priority_idx]
        confidence = float(proba[priority_idx])

        sentiment, complexity, ai_priority = _derive_scores(proba, classes)
        aging = self._compute_aging(created_at)

        # Blend aging into the final score (25% weight, same as original spec)
        ai_priority_final = float(np.clip(ai_priority * 0.75 + aging * 0.25, 0.0, 1.0))

        return {
            "sentimentScore":  round(sentiment, 4),
            "complexityScore": round(complexity, 4),
            "agingScore":      round(aging, 4),
            "aiPriorityScore": round(ai_priority_final, 4),
            "priority":        priority,
            "confidence":      round(confidence, 4),
            "reasoning":       _build_reasoning(priority, sentiment, complexity, aging),
            "model_ready":     True,
        }

    def _fallback(self, created_at: Optional[str]) -> dict:
        aging = self._compute_aging(created_at)
        return {
            "sentimentScore":  0.5,
            "complexityScore": 0.5,
            "agingScore":      round(aging, 4),
            "aiPriorityScore": round(0.5 * 0.75 + aging * 0.25, 4),
            "priority":        "medium",
            "confidence":      0.5,
            "reasoning":       "Model not yet trained — using fallback scores.",
            "model_ready":     False,
        }


_predictor = Predictor()


def get_predictor() -> Predictor:
    return _predictor
