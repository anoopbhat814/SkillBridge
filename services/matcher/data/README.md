# Matcher reference data

| File | Used by | Description |
|------|---------|-------------|
| `skill_aliases.json` | `app/core/aliases.py` | Maps shorthand (`k8s`) to canonical skill names |
| `skill_taxonomy.json` | `app/core/resume_parser.py` | Known skills grouped by category |
| `stopwords.json` | `app/core/embeddings.py` | Tokens dropped before vectorising text |
| `seniority_keywords.json` | `app/core/scoring.py` | Phrases hinting at required seniority |

Keep keys lowercase; aliases are looked up after `str.strip().lower()`.
