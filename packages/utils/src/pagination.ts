export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

/** Trims an over-fetched (limit + 1) result set into a cursor page. */
export function toCursorPage<T extends { id: string }>(rows: T[], limit: number): CursorPage<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
}
