import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.trainer import train

if __name__ == "__main__":
    train()
