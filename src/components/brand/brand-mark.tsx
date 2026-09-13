import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandMarkProps = { href?: string; compact?: boolean; className?: string; tone?: "light" | "dark" };

export function BrandMark({ href = "/", compact = false, className, tone = "light" }: BrandMarkProps) {
  const content = (
    <div className={cn("group flex items-center gap-3", className)}>
      <div className="relative h-10 w-10 shrink-0">
        <div className="absolute inset-0 rotate-45 rounded-[11px] border border-violet-400/60 bg-[#11162a] shadow-[0_0_28px_rgba(124,58,237,.28)]" />
        <div className="absolute left-[8px] top-[8px] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" />
        <div className="absolute bottom-[8px] right-[8px] h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,.9)]" />
        <div className="absolute left-[12px] top-[19px] h-px w-[17px] -rotate-45 bg-gradient-to-r from-cyan-300 to-violet-400" />
        <div className="absolute inset-[13px] rounded-full border border-white/70" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className={cn("text-[15px] font-black tracking-[0.22em]", tone === "dark" ? "text-white" : "text-[#0b1020]")}>TALNIVO</p>
          <p className={cn("mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em]", tone === "dark" ? "text-slate-500" : "text-slate-500")}>Talent intelligence</p>
        </div>
      )}
    </div>
  );
  if (!href) return content;
  return <Link href={href} aria-label="TALNIVO home" className="inline-flex">{content}</Link>;
}
