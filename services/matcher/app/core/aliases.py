import json
from functools import lru_cache
from pathlib import Path

_PATH = Path(__file__).resolve().parents[2] / "data" / "skill_aliases.json"


@lru_cache(maxsize=1)
def _aliases() -> dict[str, str]:
    return json.loads(_PATH.read_text())


def canonical(skill: str) -> str:
    key = skill.strip().lower()
    return _aliases().get(key, key)
