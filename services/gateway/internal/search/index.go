package search

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"sync"
	"unicode"
)

// Document is an indexed job or candidate record.
type Document struct {
	ID     string         `json:"id"`
	Kind   string         `json:"kind"`
	Fields map[string]any `json:"fields"`
}

// Index is an in-memory inverted index with TF scoring.
type Index struct {
	mu       sync.RWMutex
	docs     map[string]Document
	postings map[string]map[string]int // term -> docID -> frequency
}

func NewIndex() *Index {
	return &Index{docs: map[string]Document{}, postings: map[string]map[string]int{}}
}

func tokenize(s string) []string {
	return strings.FieldsFunc(strings.ToLower(s), func(r rune) bool { return !unicode.IsLetter(r) && !unicode.IsDigit(r) })
}

// Put inserts or replaces a document.
func (ix *Index) Put(doc Document) {
	ix.mu.Lock()
	defer ix.mu.Unlock()
	ix.removeLocked(doc.ID)
	ix.docs[doc.ID] = doc
	for _, v := range doc.Fields {
		if s, ok := v.(string); ok {
			for _, t := range tokenize(s) {
				if ix.postings[t] == nil {
					ix.postings[t] = map[string]int{}
				}
				ix.postings[t][doc.ID]++
			}
		}
	}
}

func (ix *Index) removeLocked(id string) {
	if _, ok := ix.docs[id]; !ok {
		return
	}
	for term, p := range ix.postings {
		delete(p, id)
		if len(p) == 0 {
			delete(ix.postings, term)
		}
	}
	delete(ix.docs, id)
}

// Hit is a ranked search result.
type Hit struct {
	ID    string  `json:"id"`
	Score float64 `json:"score"`
}

// Query ranks documents by summed term frequency for every query term.
func (ix *Index) Query(q string, limit int) []Hit {
	ix.mu.RLock()
	defer ix.mu.RUnlock()
	scores := map[string]float64{}
	for _, t := range tokenize(q) {
		for id, tf := range ix.postings[t] {
			scores[id] += float64(tf)
		}
	}
	hits := make([]Hit, 0, len(scores))
	for id, s := range scores {
		hits = append(hits, Hit{ID: id, Score: s})
	}
	sort.Slice(hits, func(i, j int) bool { return hits[i].Score > hits[j].Score })
	if limit > 0 && len(hits) > limit {
		hits = hits[:limit]
	}
	return hits
}

// HandleIndex serves PUT /index/{kind}/{id}.
func (ix *Index) HandleIndex(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/index/"), "/")
	if r.Method != http.MethodPut || len(parts) != 2 {
		http.Error(w, "use PUT /index/{kind}/{id}", http.StatusBadRequest)
		return
	}
	var fields map[string]any
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	ix.Put(Document{ID: parts[1], Kind: parts[0], Fields: fields})
	w.WriteHeader(http.StatusNoContent)
}

// HandleSearch serves GET /search?q=...
func (ix *Index) HandleSearch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ix.Query(r.URL.Query().Get("q"), 20))
}
