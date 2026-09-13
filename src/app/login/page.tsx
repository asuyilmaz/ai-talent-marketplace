"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BrainCircuit, CheckCircle2, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";

type UserRole = "candidate" | "employer";

type LoginResponse = {
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.user) {
        setError(data.message || "Invalid email or password.");
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

        <div className="relative max-w-xl py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome back
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-[-0.05em] leading-[1.02]">
            Pick up where your
            <span className="block text-violet-300">next move started.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
            Return to your TALNIVO workspace for jobs, matches, applications, skill insights, and AI-powered interview practice.
          </p>

          <div className="mt-8 space-y-3">
            {["Role-based secure workspace", "Persistent interview practice", "Real job and application data"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.05] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">TALNIVO AI</p>
            <p className="mt-0.5 text-xs text-slate-500">Practice smarter. Improve with every answer.</p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[460px]">
          <div className="mb-10 lg:hidden">
            <BrandMark href="/" />
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Sign in</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Welcome back.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Enter your account details to open your TALNIVO workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700">
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to TALNIVO?{" "}
            <Link href="/register" className="font-bold text-violet-600 transition hover:text-violet-700">
              Create an account
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
