"""TF-IDF based semantic similarity between job descriptions and resumes."""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def text_similarity(a: str, b: str) -> float:
    if not a.strip() or not b.strip():
        return 0.0
    vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    matrix = vec.fit_transform([a, b])
    return float(cosine_similarity(matrix[0], matrix[1])[0][0])


def rank_candidates(job_text: str, candidates: dict[str, str]) -> list[tuple[str, float]]:
    """Return (candidate_id, similarity) pairs sorted best-first."""
    scored = [(cid, text_similarity(job_text, text)) for cid, text in candidates.items()]
    return sorted(scored, key=lambda p: p[1], reverse=True)
