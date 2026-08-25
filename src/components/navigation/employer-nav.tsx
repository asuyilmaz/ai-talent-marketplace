import Link from "next/link";

export function EmployerNav() {
  return (
    <nav className="space-y-1">
      <Link
        href="/employer/dashboard"
        className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
      >
        Dashboard
      </Link>

      <Link
        href="/employer/company"
        className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
      >
        Company
      </Link>

      <Link
        href="/employer/jobs"
        className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
      >
        Jobs
      </Link>

      <Link
        href="/employer/applicants"
        className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
      >
        Applicants
      </Link>

      <Link
        href="/employer/candidates"
        className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
      >
        Candidates
      </Link>

      <Link
        href="/employer/settings"
        className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
      >
        Settings
      </Link>
    </nav>
  );
}