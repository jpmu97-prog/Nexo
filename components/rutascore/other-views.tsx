"use client"

import { TrendingUp, Award, Ghost, ChevronRight } from "lucide-react"
import { formatCOP } from "@/lib/rutascore"
import { cn } from "@/lib/utils"

const HISTORY = [
  { day: "Ayer", net: 82000, gross: 138000, score: 79 },
  { day: "Martes", net: 54000, gross: 121000, score: 45 },
  { day: "Lunes", net: 71000, gross: 110000, score: 65 },
  { day: "Domingo", net: 96000, gross: 145000, score: 83 },
  { day: "Sábado", net: 118000, gross: 190000, score: 62 },
]

function scoreTone(score: number) {
  return score >= 70
    ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400"
    : score >= 45
      ? "bg-black/[0.05] text-black/70 dark:bg-white/[0.06] dark:text-white/70"
      : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
}

const CARD =
  "rounded-3xl border border-black/[0.06] bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] dark:shadow-none"

export function HistoryView() {
  const weekNet = HISTORY.reduce((s, d) => s + d.net, 0)
  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <header className="px-1 pt-3">
        <p className="text-sm font-medium text-black/50 dark:text-white/50">
          Últimos 5 días
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
          Historial
        </h1>
      </header>

      <section className={cn(CARD, "p-6")}>
        <p className="flex items-center gap-1.5 text-sm font-medium text-black/50 dark:text-white/50">
          <TrendingUp className="h-4 w-4" strokeWidth={2} />
          Te quedó limpio esta semana
        </p>
        <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatCOP(weekNet)}
        </p>
      </section>

      <section className={cn(CARD, "p-2")}>
        <ul>
          {HISTORY.map((d, i) => (
            <li
              key={d.day}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5",
                i !== HISTORY.length - 1 &&
                  "border-b border-black/[0.05] dark:border-white/5",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
                  scoreTone(d.score),
                )}
              >
                {d.score}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white">
                  {d.day}
                </p>
                <p className="text-xs font-medium text-black/40 dark:text-white/40">
                  Me hice {formatCOP(d.gross)}
                </p>
              </div>
              <span className="text-[15px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatCOP(d.net)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function ProfileView() {
  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <header className="px-1 pt-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
          Perfil
        </h1>
      </header>

      <section className={cn(CARD, "flex items-center gap-4 p-6")}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white dark:bg-emerald-400 dark:text-black">
          P
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-[#1d1d1f] dark:text-white">
            Parce Domiciliario
          </p>
          <p className="text-sm font-medium text-black/50 dark:text-white/50">
            Rappi · DiDi · Particular
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className={cn(CARD, "p-5")}>
          <Award
            className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
            strokeWidth={2}
          />
          <p className="mt-3 text-2xl font-bold tabular-nums text-[#1d1d1f] dark:text-white">
            72
          </p>
          <p className="text-xs font-medium text-black/40 dark:text-white/40">
            Score promedio
          </p>
        </div>
        <div className={cn(CARD, "p-5")}>
          <Ghost
            className="h-6 w-6 text-rose-600 dark:text-rose-400"
            strokeWidth={2}
          />
          <p className="mt-3 text-2xl font-bold tabular-nums text-[#1d1d1f] dark:text-white">
            {formatCOP(35000)}
          </p>
          <p className="text-xs font-medium text-black/40 dark:text-white/40">
            Gastos fantasma / semana
          </p>
        </div>
      </section>

      <section className={cn(CARD, "p-2")}>
        {["Meta diaria", "Plataformas", "Notificaciones", "Ayuda"].map(
          (item, i, arr) => (
            <button
              key={item}
              className={cn(
                "flex w-full items-center justify-between px-4 py-4 text-left",
                i !== arr.length - 1 &&
                  "border-b border-black/[0.05] dark:border-white/5",
              )}
            >
              <span className="text-[15px] font-medium text-[#1d1d1f] dark:text-white">
                {item}
              </span>
              <ChevronRight
                className="h-5 w-5 text-black/30 dark:text-white/30"
                strokeWidth={2}
              />
            </button>
          ),
        )}
      </section>

      <p className="px-2 text-center text-xs font-medium text-black/40 dark:text-white/40">
        No es cuánto hiciste. Es cuánto te quedó.
      </p>
    </div>
  )
}
