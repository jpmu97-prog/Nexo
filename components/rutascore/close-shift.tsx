"use client"

import { useEffect, useState } from "react"
import { X, Share2, Ghost, Route } from "lucide-react"
import {
  CURRENT_STREAK,
  STREAK_XP_PER_DAY,
  earnedBadges,
  formatCOP,
  WEEK_STREAK,
  type Badge,
} from "@/lib/rutascore"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  gross: number
  expenses: number
  net: number
  onClose: () => void
}

const BADGE_ICON: Record<string, typeof Ghost> = {
  "sin-fantasmas": Ghost,
  "km-rentable": Route,
}

export function CloseShift({ open, gross, expenses, net, onClose }: Props) {
  if (!open) return null
  return (
    <CloseShiftInner
      gross={gross}
      expenses={expenses}
      net={net}
      onClose={onClose}
    />
  )
}

function CloseShiftInner({
  gross,
  expenses,
  net,
  onClose,
}: Omit<Props, "open">) {
  const score =
    gross > 0 ? Math.max(0, Math.min(100, Math.round((net / gross) * 100))) : 0
  const verdict =
    score >= 70 ? "¡Día en Verde!" : score >= 45 ? "Día Estable" : "Día Apretado"

  const ghost = expenses // used only to gate the "Sin Fantasmas" badge presence
  const badges = earnedBadges(gross, ghost)

  const shareText = `Hoy en RutaScore: mi día no fue de ${formatCOP(
    gross,
  )}. Fue de ${formatCOP(net)} limpio. Score ${score}/100 — ${verdict}`
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  // Animate the gauge from 0 to score on mount.
  const [animScore, setAnimScore] = useState(0)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimScore(score))
    return () => cancelAnimationFrame(raf)
  }, [score])

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center p-3 sm:items-center">
      {/* Scrim */}
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300 dark:bg-black/60"
      />

      {/* Glass card */}
      <div className="relative flex max-h-[94dvh] w-full max-w-md flex-col overflow-y-auto rounded-[2rem] border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 dark:border-white/10 dark:bg-[#141416]/85">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-black/45 dark:text-white/45">
            Cierre de jornada
          </p>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-black/60 active:scale-95 dark:bg-white/10 dark:text-white/70"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Hero gauge */}
        <div className="mt-4 flex flex-col items-center">
          <ScoreGauge score={animScore} />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {verdict}
          </h2>
        </div>

        {/* The truth */}
        <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-[15px] font-medium leading-relaxed text-balance text-black/70 dark:text-white/70">
            Tu día no fue de{" "}
            <span className="font-semibold text-black/50 line-through dark:text-white/50">
              {formatCOP(gross)}
            </span>
            . Fue de{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCOP(net)} limpio
            </span>
            .
          </p>
        </div>

        {/* Streak */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-3.5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-1.5">
            {WEEK_STREAK.map((d, i) => (
              <span
                key={i}
                className={cn(
                  "h-3 w-3 rounded-full transition-colors",
                  i < CURRENT_STREAK
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] dark:bg-emerald-400"
                    : "bg-black/10 dark:bg-white/15",
                )}
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
            Racha: {CURRENT_STREAK} Días{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              (+{CURRENT_STREAK * STREAK_XP_PER_DAY} XP)
            </span>
          </p>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {badges.map((b) => (
              <BadgeCard key={b.key} badge={b} />
            ))}
          </div>
        )}

        {/* CTA zone */}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-4 text-base font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition active:scale-[0.98] dark:bg-emerald-400 dark:text-black"
        >
          <Share2 className="h-5 w-5" strokeWidth={2.5} />
          Compartir Resumen
        </a>
        <button
          onClick={onClose}
          className="mt-2 py-2 text-sm font-medium text-black/45 transition active:scale-95 dark:text-white/45"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  const Icon = BADGE_ICON[badge.key] ?? Ghost
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-center dark:border-emerald-400/20 dark:bg-emerald-400/[0.08]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.4)] dark:bg-emerald-400/15 dark:text-emerald-400">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <div>
        <p className="text-sm font-bold text-[#1d1d1f] dark:text-white">
          {badge.label}
        </p>
        <p className="mt-0.5 text-[11px] font-medium leading-snug text-black/45 text-pretty dark:text-white/45">
          {badge.description}
        </p>
      </div>
    </div>
  )
}

function ScoreGauge({ score }: { score: number }) {
  const size = 168
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-black/[0.07] dark:stroke-white/[0.1]"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-emerald-500 dark:stroke-emerald-400"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)",
            filter: "drop-shadow(0 0 8px rgba(16,185,129,0.5))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-bold leading-none tracking-tight tabular-nums text-[#1d1d1f] dark:text-white">
          {score}
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-black/45 dark:text-white/45">
          Score de jornada
        </span>
      </div>
    </div>
  )
}
