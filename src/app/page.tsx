import Link from "next/link";
import { ArrowRight, BrainCircuit, BriefcaseBusiness, Check, MoveUpRight, ScanSearch } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3f1ec] text-[#101114]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-20 max-w-[1540px] items-center px-5 sm:px-8 lg:px-10">
          <BrandMark />
          <nav className="ml-auto hidden items-center gap-8 md:flex">
            <a href="#platform" className="text-xs font-bold text-[#6f6e73] hover:text-black">Platform</a>
            <a href="#how" className="text-xs font-bold text-[#6f6e73] hover:text-black">How it works</a>
            <Link href="/login" className="text-xs font-bold">Sign in</Link>
          </nav>
          <Link href="/register" className="ml-5 inline-flex h-10 items-center gap-2 bg-[#101114] px-4 text-xs font-black text-white">
            Start <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1540px] border-x border-black/10">
        <div className="grid min-h-[720px] lg:grid-cols-[1.12fr_.88fr]">
          <div className="flex flex-col justify-between border-b border-black/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <div className="flex items-center gap-4">
              <span className="tn-index">Talent infrastructure / 2026</span>
              <span className="h-px w-12 bg-[#5b3df5]" />
            </div>

            <div className="py-16 lg:py-20">
              <h1 className="max-w-[900px] text-[clamp(4rem,8.2vw,8.8rem)] font-black leading-[.79] tracking-[-.085em]">
                Talent,<br />
                without the<br />
                <span className="text-[#5b3df5]">guesswork.</span>
              </h1>
            </div>

            <div className="grid gap-7 border-t border-black/10 pt-7 sm:grid-cols-[1fr_auto] sm:items-end">
              <p className="max-w-xl text-base leading-7 text-[#5f6065]">
                TALNIVO connects skill-based matching, interview practice and hiring workflows in one product — built around decisions, not noise.
              </p>
              <Link href="/register" className="inline-flex items-center gap-3 border-b border-black pb-1 text-sm font-black">
                Build your workspace <MoveUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="bg-[#101114] p-6 text-white sm:p-10 lg:p-12">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/15 pb-5">
                <span className="tn-index text-white/45">TALNIVO / workspace preview</span>
                <span className="flex items-center gap-2 text-[10px] font-bold text-white/50"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live</span>
              </div>

              <div className="flex flex-1 flex-col justify-center py-12">
                <p className="text-sm font-bold text-white/45">Frontend Engineer</p>
                <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-6 border-b border-white/15 pb-8">
                  <p className="text-7xl font-black tracking-[-.08em]">86<span className="text-xl text-white/25">%</span></p>
                  <p className="tn-index text-[#9c90ff]">role fit</p>
                </div>

                <div className="divide-y divide-white/10">
                  {[
                    ["01", "Skill overlap", "8 matched skills"],
                    ["02", "Interview practice", "90 / 100"],
                    ["03", "Application status", "Ready to apply"],
                  ].map(([n, label, value]) => (
                    <div key={n} className="grid grid-cols-[42px_1fr_auto] gap-4 py-5 text-sm">
                      <span className="font-mono text-[10px] text-white/25">{n}</span>
                      <span className="font-bold">{label}</span>
                      <span className="text-white/45">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 border border-white/15">
                {[
                  ["12", "open roles"],
                  ["05", "applications"],
                  ["03", "strong matches"],
                ].map(([v, l]) => (
                  <div key={l} className="border-r border-white/15 p-4 last:border-r-0">
                    <p className="text-2xl font-black">{v}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[.13em] text-white/35">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-[1540px] border-x border-b border-black/10">
        {[
          ["01", ScanSearch, "Match on skills, not keywords.", "Candidates see where they genuinely overlap with a role. Employers get a cleaner signal than generic search."],
          ["02", BrainCircuit, "Practice the interview that matters.", "Job-aware questions, scoring and structured feedback live inside a focused practice workspace."],
          ["03", BriefcaseBusiness, "Run hiring from one operating view.", "Jobs, applications and candidate discovery are connected instead of scattered across disconnected admin screens."],
        ].map(([n, Icon, title, text]) => {
          const IconComponent = Icon as typeof ScanSearch;
          return (
            <div key={String(n)} className="grid border-t border-black/10 first:border-t-0 lg:grid-cols-[120px_90px_1fr_1fr]">
              <div className="p-6 lg:p-8"><span className="font-mono text-xs text-[#9a989d]">{String(n)}</span></div>
              <div className="px-6 pb-2 lg:p-8"><IconComponent className="h-5 w-5 text-[#5b3df5]" /></div>
              <div className="px-6 pb-5 lg:p-8"><h2 className="max-w-md text-3xl font-black tracking-[-.045em]">{String(title)}</h2></div>
              <div className="px-6 pb-8 lg:p-8"><p className="max-w-lg text-sm leading-7 text-[#626166]">{String(text)}</p></div>
            </div>
          );
        })}
      </section>

      <section id="how" className="mx-auto grid max-w-[1540px] border-x border-b border-black/10 lg:grid-cols-[.8fr_1.2fr]">
        <div className="border-b border-black/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <p className="tn-index">For both sides of the market</p>
          <h2 className="mt-5 text-4xl font-black tracking-[-.055em] sm:text-5xl">One product.<br />Two serious workspaces.</h2>
        </div>
        <div className="grid sm:grid-cols-2">
          <div className="border-b border-black/10 p-8 sm:border-b-0 sm:border-r lg:p-12">
            <p className="tn-index text-[#5b3df5]">Candidate</p>
            <p className="mt-4 text-xl font-black">Know where you fit.</p>
            <div className="mt-6 space-y-3 text-sm text-[#626166]">
              {["Role matching", "Skill gap analysis", "AI interview practice", "Application tracking"].map((x) => (
                <p key={x} className="flex items-center gap-3"><Check className="h-3.5 w-3.5 text-[#5b3df5]" /> {x}</p>
              ))}
            </div>
          </div>
          <div className="p-8 lg:p-12">
            <p className="tn-index text-[#5b3df5]">Employer</p>
            <p className="mt-4 text-xl font-black">See the hiring system clearly.</p>
            <div className="mt-6 space-y-3 text-sm text-[#626166]">
              {["Role management", "Applicant pipeline", "Candidate discovery", "Company workspace"].map((x) => (
                <p key={x} className="flex items-center gap-3"><Check className="h-3.5 w-3.5 text-[#5b3df5]" /> {x}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1540px] border-x border-b border-black/10 bg-[#5b3df5] p-8 text-white sm:p-12 lg:p-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="tn-index text-white/55">Your talent. Your next level.</p>
            <h2 className="mt-5 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.065em] sm:text-7xl">
              Make the next move with more signal.
            </h2>
          </div>
          <Link href="/register" className="inline-flex h-12 items-center gap-3 bg-white px-5 text-sm font-black text-[#101114]">
            Enter TALNIVO <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1540px] items-center justify-between border-x border-black/10 px-6 py-7 sm:px-10">
        <BrandMark compact />
        <p className="tn-index">© 2026 TALNIVO</p>
      </footer>
    </main>
  );
}
