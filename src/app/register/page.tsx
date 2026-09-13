"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Sparkles, UserRound } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";

type UserRole = "candidate" | "employer";

type RegisterResponse = {
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("candidate");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = (await response.json()) as RegisterResponse;

      if (!response.ok || !data.user) {
        setError(data.message || "Unable to create the account.");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      router.push(data.user.role === "candidate" ? "/candidate/dashboard" : "/employer/dashboard");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-[#0B1020] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.32),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(79,70,229,0.2),transparent_35%)]" />
        <div className="relative">
          <BrandMark href="/" tone="dark" />
        </div>

        <div className="relative max-w-xl py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            Build your TALNIVO workspace
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-[-0.05em] leading-[1.02]">
            One account.
            <span className="block text-violet-300">A clearer next step.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
            Join as a candidate to grow your career or as an employer to discover and manage talent with less friction.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.05] p-4">
              <UserRound className="h-5 w-5 text-violet-300" />
              <p className="mt-3 text-sm font-semibold">For candidates</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Jobs, matches, skill gaps, applications, and AI practice.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.05] p-4">
              <BriefcaseBusiness className="h-5 w-5 text-indigo-300" />
              <p className="mt-3 text-sm font-semibold">For employers</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Publish jobs, review applicants, and discover candidates.</p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-4 text-xs text-slate-400">
          {["Secure sessions", "Role-based access", "AI-powered coaching"].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:py-12">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 lg:hidden">
            <BrandMark href="/" />
          </div>

          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Create account</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Start your next level.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Choose your workspace and create your TALNIVO account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-800">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-800">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-800">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Account type</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`rounded-xl border p-3 text-left transition ${role === "candidate" ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <UserRound className={`h-4 w-4 ${role === "candidate" ? "text-violet-600" : "text-slate-400"}`} />
                  <p className="mt-2 text-sm font-bold text-slate-900">Candidate</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Find and grow</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`rounded-xl border p-3 text-left transition ${role === "employer" ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <BriefcaseBusiness className={`h-4 w-4 ${role === "employer" ? "text-violet-600" : "text-slate-400"}`} />
                  <p className="mt-2 text-sm font-bold text-slate-900">Employer</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Hire and manage</p>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700">
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-violet-600 transition hover:text-violet-700">
              Sign in
            </Link>
          </p>

          <Link href="/" className="mt-4 block text-center text-xs font-medium text-slate-400 transition hover:text-slate-600">
            Back to TALNIVO
          </Link>
        </div>
      </section>
    </main>
  );
}
