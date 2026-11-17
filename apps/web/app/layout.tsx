import type { ReactNode } from "react";
import Link from "next/link";
import { Providers } from "../components/Providers";

export const metadata = { title: "SkillBridge", description: "Hire and get hired on verified skills" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="topbar">
          <Link href="/">SkillBridge</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/assessments/typescript">Assessments</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/dashboard">Employer</Link>
        </nav>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
