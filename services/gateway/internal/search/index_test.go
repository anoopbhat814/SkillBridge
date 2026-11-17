package search

import "testing"

func TestQueryRanksByFrequency(t *testing.T) {
	ix := NewIndex()
	ix.Put(Document{ID: "a", Kind: "job", Fields: map[string]any{"title": "Go engineer", "body": "go go go services"}})
	ix.Put(Document{ID: "b", Kind: "job", Fields: map[string]any{"title": "Python engineer", "body": "go once"}})

	hits := ix.Query("go", 10)
	if len(hits) != 2 || hits[0].ID != "a" {
		t.Fatalf("unexpected ranking: %+v", hits)
	}
}

func TestPutReplacesDocument(t *testing.T) {
	ix := NewIndex()
	ix.Put(Document{ID: "a", Fields: map[string]any{"title": "rust developer"}})
	ix.Put(Document{ID: "a", Fields: map[string]any{"title": "kotlin developer"}})

	if hits := ix.Query("rust", 10); len(hits) != 0 {
		t.Fatalf("stale postings remain: %+v", hits)
	}
	if hits := ix.Query("kotlin", 10); len(hits) != 1 {
		t.Fatalf("expected 1 hit, got %+v", hits)
	}
}
