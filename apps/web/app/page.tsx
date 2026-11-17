import Link from "next/link";

const STEPS = [
  { title: "Prove your skills", body: "Take timed assessments and earn verified skill badges." },
  { title: "Get matched", body: "Our matcher ranks roles by skill overlap and seniority." },
  { title: "Interview fast", body: "Pick a slot straight from the employer's calendar." },
];

export default function Home() {
  return (
    <main>
      <h1>Hire on proof, not keywords.</h1>
      <p>SkillBridge connects verified talent with teams that need it.</p>
      <Link href="/jobs">Browse open roles</Link>
      <ol>
        {STEPS.map((s) => (
          <li key={s.title}>
            <strong>{s.title}</strong> - {s.body}
          </li>
        ))}
      </ol>
    </main>
  );
}
