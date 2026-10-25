import os
import csv
import warnings
import numpy as np
import joblib
from typing import Dict, Any, List

# Suppress version warnings if scikit-learn has minor version differences
warnings.filterwarnings("ignore", category=UserWarning)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
PRIORITY_MODEL_PATH = os.path.join(MODELS_DIR, "priority_selected_model.joblib")
QUEUE_MODEL_PATH = os.path.join(MODELS_DIR, "queue_selected_model.joblib")
TEST_RESULTS_CSV = os.path.join(MODELS_DIR, "selected_model_test_results.csv")
VALIDATION_CSV = os.path.join(MODELS_DIR, "validation_model_comparison.csv")

class TicketClassifierService:
    def __init__(self):
        self.priority_model = None
        self.queue_model = None
        self.priority_classes: List[str] = []
        self.queue_classes: List[str] = []
        self.is_loaded = False
        self.model_metrics: Dict[str, Any] = {}
        self._load_models()
        self._load_metrics()

    def _load_models(self):
        try:
            if os.path.exists(PRIORITY_MODEL_PATH):
                self.priority_model = joblib.load(PRIORITY_MODEL_PATH)
                self.priority_classes = list(getattr(self.priority_model, "classes_", []))
            else:
                print(f"[Classifier] Warning: {PRIORITY_MODEL_PATH} not found")

            if os.path.exists(QUEUE_MODEL_PATH):
                self.queue_model = joblib.load(QUEUE_MODEL_PATH)
                self.queue_classes = list(getattr(self.queue_model, "classes_", []))
            else:
                print(f"[Classifier] Warning: {QUEUE_MODEL_PATH} not found")

            if self.priority_model and self.queue_model:
                self.is_loaded = True
                print("[Classifier] Successfully loaded Priority & Queue classification models.")
                # Run warmup
                self.classify_text("System startup check", "Validating pipeline readiness.")
        except Exception as e:
            print(f"[Classifier] Error loading models: {e}")
            self.is_loaded = False

    def _load_metrics(self):
        try:
            test_results = []
            if os.path.exists(TEST_RESULTS_CSV):
                with open(TEST_RESULTS_CSV, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        test_results.append(row)

            val_results = []
            if os.path.exists(VALIDATION_CSV):
                with open(VALIDATION_CSV, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        val_results.append(row)

            self.model_metrics = {
                "test_results": test_results,
                "validation_comparison": val_results,
                "priority_classes": self.priority_classes,
                "queue_classes": self.queue_classes,
                "model_architecture": "LinearSVC (C=2.0) with Word & Character N-Gram TF-IDF FeatureUnion"
            }
        except Exception as e:
            print(f"[Classifier] Error reading metrics CSV: {e}")
            self.model_metrics = {}

    @staticmethod
    def _softmax(scores: np.ndarray, temperature: float = 1.0) -> np.ndarray:
        scaled = np.array(scores, dtype=np.float64) / max(temperature, 0.1)
        exp_vals = np.exp(scaled - np.max(scaled))
        return exp_vals / np.sum(exp_vals)

    def classify_text(self, subject: str, description: str) -> Dict[str, Any]:
        combined_text = f"{subject.strip()}\n{description.strip()}".strip()
        if not combined_text:
            combined_text = "Empty inquiry"

        if not self.is_loaded:
            # Fallback if models are not loaded
            return {
                "queue": "General Inquiry",
                "queue_confidence": 0.50,
                "top_queues": [{"queue": "General Inquiry", "confidence": 0.50}],
                "all_queue_scores": {"General Inquiry": 0.50},
                "priority": "medium",
                "priority_confidence": 0.50,
                "priority_distribution": {"high": 0.25, "medium": 0.50, "low": 0.25},
                "processed_text": combined_text
            }

        input_batch = [combined_text]

        # 1. Queue Classification (10 classes: calibrated temperature 0.35 for realistic margin confidence)
        queue_df = self.queue_model.decision_function(input_batch)[0]
        queue_probs = self._softmax(queue_df, temperature=0.35)
        queue_pred = str(self.queue_model.predict(input_batch)[0])

        queue_score_dict = {
            str(cls_name): round(float(prob), 4)
            for cls_name, prob in zip(self.queue_classes, queue_probs)
        }
        
        # Sort top queues
        sorted_queues = sorted(queue_score_dict.items(), key=lambda x: x[1], reverse=True)
        top_queues = [{"queue": q, "confidence": score} for q, score in sorted_queues[:3]]
        queue_confidence = queue_score_dict.get(queue_pred, round(float(np.max(queue_probs)), 4))

        # 2. Priority Classification (3 classes: calibrated temperature 0.8)
        priority_df = self.priority_model.decision_function(input_batch)[0]
        priority_probs = self._softmax(priority_df, temperature=0.8)
        priority_pred = str(self.priority_model.predict(input_batch)[0])

        priority_distribution = {
            str(cls_name): round(float(prob), 4)
            for cls_name, prob in zip(self.priority_classes, priority_probs)
        }
        priority_confidence = priority_distribution.get(priority_pred, round(float(np.max(priority_probs)), 4))

        return {
            "queue": queue_pred,
            "queue_confidence": queue_confidence,
            "top_queues": top_queues,
            "all_queue_scores": queue_score_dict,
            "priority": priority_pred.lower(),
            "priority_confidence": priority_confidence,
            "priority_distribution": priority_distribution,
            "processed_text": combined_text
        }

    def get_info(self) -> Dict[str, Any]:
        return {
            "loaded": self.is_loaded,
            "priority_classes": self.priority_classes,
            "queue_classes": self.queue_classes,
            "metrics": self.model_metrics
        }

# Global instance
classifier_service = TicketClassifierService()
