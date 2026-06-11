import argparse
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.dataset_generator import generate_dataset

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic training data using Groq LLM")
    parser.add_argument("--total", type=int, default=500, help="Total number of tickets to generate")
    parser.add_argument("--batch-size", type=int, default=20, help="Tickets per Groq API call")
    parser.add_argument("--output", default="data/processed/train.csv", help="Output CSV path")
    args = parser.parse_args()
    generate_dataset(total=args.total, batch_size=args.batch_size, output_path=args.output)
