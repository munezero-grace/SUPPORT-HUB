import argparse
import csv
import json
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import config
from groq import Groq

SYSTEM_PROMPT = (
    "You are a support ticket rewriter. "
    "Return ONLY a valid JSON array. No markdown, no code fences, just the raw JSON array."
)

USER_PROMPT_TEMPLATE = """Given this support ticket, generate {n} paraphrased versions.

Original:
Title: {title}
Description: {description}

Rules:
- Preserve the exact same issue, urgency level, and technical context
- Use different vocabulary, sentence structure, and tone
- Each version should sound like it was written by a different person
- Descriptions should be 1-3 sentences

Return ONLY a JSON array of {n} objects with "title" and "description" fields."""


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


def paraphrase_ticket(client: Groq, title: str, description: str, n: int = 3, retries: int = 3) -> list:
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model=config.GROQ_MODEL,
                temperature=0.9,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": USER_PROMPT_TEMPLATE.format(
                        n=n, title=title, description=description
                    )},
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
            print(f"    Attempt {attempt + 1} failed: {err_str[:80]}. Waiting {wait:.1f}s...")
            time.sleep(wait)
    print("    All attempts failed — skipping paraphrases for this ticket.")
    return []


def load_source(path: str) -> list:
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()
    # Skip lines that are blank or contain only commas (the CSV has a junk first row)
    while lines and not lines[0].replace(',', '').strip():
        lines = lines[1:]
    rows = [r for r in csv.DictReader(lines) if r.get('id', '').strip()]
    return rows


def augment(
    source_path: str,
    output_path: str,
    n_paraphrases: int = 3,
    delay: float = 0.5,
):
    if not config.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set in .env")

    rows = load_source(source_path)
    print(f"Loaded {len(rows)} source tickets from {source_path}")
    print(f"Target size: {len(rows)} originals + {len(rows) * n_paraphrases} paraphrases = {len(rows) * (n_paraphrases + 1)}\n")

    client = Groq(api_key=config.GROQ_API_KEY)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    fieldnames = ["title", "description", "label", "source_type"]

    # Load already-done titles so the script is resumable after interruption
    done_titles: set = set()
    if os.path.exists(output_path):
        with open(output_path, encoding="utf-8") as f:
            existing_header = f.readline().strip()
        expected_header = ",".join(fieldnames)
        if existing_header != expected_header:
            print(f"WARNING: {output_path} has a different schema ({existing_header!r}).")
            print("Deleting it and starting fresh to avoid a mixed-format file.\n")
            os.remove(output_path)
        else:
            with open(output_path, encoding="utf-8") as f:
                for r in csv.DictReader(f):
                    if r.get("source_type") == "original":
                        done_titles.add(r["title"].strip())
            print(f"Resuming — {len(done_titles)} tickets already processed.\n")

    write_mode = "a" if os.path.exists(output_path) else "w"
    with open(output_path, write_mode, newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if write_mode == "w":
            writer.writeheader()

        for i, row in enumerate(rows):
            title = row["title"].strip()
            description = row["description"].strip()
            label = row["human_label"].strip().lower()

            if title in done_titles:
                continue

            print(f"[{i + 1}/{len(rows)}] {title[:65]}")

            # Original always goes in first
            writer.writerow({
                "title": title,
                "description": description,
                "label": label,
                "source_type": "original",
            })

            paraphrases = paraphrase_ticket(client, title, description, n=n_paraphrases)
            written = 0
            for p in paraphrases:
                if p.get("title") and p.get("description"):
                    writer.writerow({
                        "title": p["title"].strip(),
                        "description": p["description"].strip(),
                        "label": label,
                        "source_type": "paraphrase",
                    })
                    written += 1
            print(f"    +{written} paraphrases")
            f.flush()

            if delay > 0 and i < len(rows) - 1:
                time.sleep(delay)

    with open(output_path, encoding="utf-8") as f:
        total = sum(1 for _ in csv.DictReader(f))

    print(f"\nDone. {output_path} → {total} total rows")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Expand dataset via paraphrasing (labels inherited from human_label)")
    parser.add_argument("--source", default="data/processed/ticket_sample.csv",
                        help="Path to the human-labeled source CSV")
    parser.add_argument("--output", default="data/processed/train.csv",
                        help="Path to write augmented output CSV")
    parser.add_argument("--paraphrases", type=int, default=3,
                        help="Paraphrases to generate per ticket (default: 3)")
    parser.add_argument("--delay", type=float, default=0.5,
                        help="Seconds to wait between tickets (default: 0.5)")
    args = parser.parse_args()

    augment(
        source_path=args.source,
        output_path=args.output,
        n_paraphrases=args.paraphrases,
        delay=args.delay,
    )
