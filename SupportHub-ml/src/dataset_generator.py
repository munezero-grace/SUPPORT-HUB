import csv
import json
import os
import re
import time
from typing import List, Dict
from groq import Groq
import config

SYSTEM_PROMPT = (
    "You are a support ticket generator. Return ONLY a valid JSON array. "
    "No markdown, no code fences, just the raw JSON array."
)

USER_PROMPT_TEMPLATE = """Generate {n} realistic software support ticket examples.
Each item must have these exact fields:
- title: short ticket title (string)
- description: 2-4 sentences with realistic developer language (string)
- sentimentScore: float 0.0-1.0 representing emotional urgency (0=calm, 1=very urgent)
- complexityScore: float 0.0-1.0 representing technical difficulty (0=trivial, 1=very complex)
- priority: one of "low", "medium", "high", "critical"

Target distribution: ~15% critical, ~25% high, ~35% medium, ~25% low.

Return ONLY a JSON array of {n} objects, nothing else."""


def _repair_json(text: str) -> str:
    last_brace = text.rfind('},')
    if last_brace == -1:
        last_brace = text.rfind('}')
    if last_brace == -1:
        return '[]'
    truncated = text[:last_brace + 1]
    first_bracket = truncated.find('[')
    if first_bracket == -1:
        return f'[{truncated}]'
    return truncated[first_bracket:] + ']'


def generate_batch(client: Groq, batch_size: int, retries: int = 3) -> List[Dict]:
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model=config.GROQ_MODEL,
                temperature=0.8,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": USER_PROMPT_TEMPLATE.format(n=batch_size)},
                ],
            )
            content = response.choices[0].message.content.strip()
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                repaired = _repair_json(content)
                return json.loads(repaired)
        except Exception as e:
            err_str = str(e)
            wait_match = re.search(r'try again in ([0-9.]+)s', err_str, re.IGNORECASE)
            wait = float(wait_match.group(1)) + 1 if wait_match else 5
            print(f"  Batch attempt {attempt + 1} failed: {err_str[:80]}. Waiting {wait}s...")
            time.sleep(wait)
    print(f"  Batch failed after {retries} attempts, skipping.")
    return []


def generate_dataset(total: int = 500, batch_size: int = 20, output_path: str = "data/processed/train.csv"):
    if not config.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set in .env")

    client = Groq(api_key=config.GROQ_API_KEY)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    all_records = []
    batches = (total + batch_size - 1) // batch_size

    for i in range(batches):
        n = min(batch_size, total - len(all_records))
        print(f"Generating batch {i + 1}/{batches} ({n} tickets)...")
        batch = generate_batch(client, n)
        all_records.extend(batch)
        print(f"  Got {len(batch)} records. Total so far: {len(all_records)}")
        if i < batches - 1:
            time.sleep(2)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["title", "description", "sentimentScore", "complexityScore", "priority"])
        writer.writeheader()
        for record in all_records:
            writer.writerow({
                "title": record.get("title", ""),
                "description": record.get("description", ""),
                "sentimentScore": record.get("sentimentScore", 0.5),
                "complexityScore": record.get("complexityScore", 0.5),
                "priority": record.get("priority", "medium"),
            })

    print(f"\nDone. Generated {len(all_records)} records → {output_path}")
    return all_records
