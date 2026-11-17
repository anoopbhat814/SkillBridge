import { useInfiniteQuery } from "@tanstack/react-query";
import type { Job, JobSearchParams, Paginated } from "@skillbridge/types";
import { api } from "../lib/api";

export function useJobs(params: JobSearchParams) {
  return useInfiniteQuery({
    queryKey: ["jobs", params],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams();
      Object.entries({ ...params, cursor: pageParam }).forEach(([k, v]) => {
        if (v !== undefined && v !== "") qs.set(k, String(v));
      });
      return api<Paginated<Job>>(`/jobs?${qs}`);
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
