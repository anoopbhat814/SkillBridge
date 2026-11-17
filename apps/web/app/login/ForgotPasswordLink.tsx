import Link from "next/link";

export function ForgotPasswordLink() {
  return (
    <p>
      <Link href="/login/reset">Forgot your password?</Link>
    </p>
  );
}
