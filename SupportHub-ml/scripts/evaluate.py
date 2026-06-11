import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.trainer import train
from src.evaluator import evaluate

if __name__ == "__main__":
    print("Re-training models to get test split artifacts for evaluation...")
    artifacts = train()
    evaluate(artifacts)
