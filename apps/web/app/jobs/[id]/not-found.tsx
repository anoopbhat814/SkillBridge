import Link from "next/link";

export default function JobNotFound() {
  return (
    <main>
      <h1>Job not found</h1>
      <p>This posting may have been closed or removed.</p>
      <Link href="/jobs">Browse open roles</Link>
    </main>
  );
}
