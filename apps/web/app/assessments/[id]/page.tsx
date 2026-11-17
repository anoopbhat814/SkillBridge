"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";

interface Question { id: string; prompt: string; options: string[] }
interface Assessment { id: string; title: string; durationMinutes: number; questions: Question[] }

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const { data } = useQuery({ queryKey: ["assessment", params.id], queryFn: () => api<Assessment>(`/assessments/${params.id}`) });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const submit = useMutation({
    mutationFn: () => api<{ score: number; passed: boolean }>(`/assessments/${params.id}/attempts`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  });

  if (!data) return <main>Loading…</main>;
  return (
    <main>
      <h1>{data.title}</h1>
      <p>{data.durationMinutes} minutes</p>
      {data.questions.map((q) => (
        <fieldset key={q.id}>
          <legend>{q.prompt}</legend>
          {q.options.map((opt, i) => (
            <label key={i}>
              <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers({ ...answers, [q.id]: i })} />
              {opt}
            </label>
          ))}
        </fieldset>
      ))}
      <button onClick={() => submit.mutate()}>Submit</button>
      {submit.data && <p>Score: {submit.data.score}% - {submit.data.passed ? "Passed" : "Not passed"}</p>}
    </main>
  );
}
