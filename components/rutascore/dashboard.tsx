"use client"

import {
  Minus,
  Plus,
  Ghost,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react"
import {
  DAILY_GOAL,
  formatCOP,
  iconForKind,
  todayLabel,
  type Transaction,
} from "@/lib/rutascore"
import { cn } from "@/lib/utils"
import {
  BentoCard,
  ChannelCard,
  StreakCard,
} from "@/components/rutascore/bento-cards"
import { QuickEvaluator } from "@/components/rutascore/route-map"
import { ThemeToggle } from "@/components/rutascore/theme-toggle"

type Props = {
  transactions: Transaction[]
  gross: number
  expenses: number
  net: number
  onAddIncome: () => void
  onAddExpense: (kind?: string) => void
  onCloseShift: () => void
}

export function Dashboard({
  transactions,
  gross,
  expenses,
  net,
  onAddIncome,
  onAddExpense,
  onCloseShift,
}: Props) {
  const progress = Math.min(100, Math.round((net / DAILY_GOAL) * 100))
  const remaining = Math.max(0, DAILY_GOAL - net)
  const ghost = transactions
    .filter((t) => t.type === "expense" && t.kind === "fantasma")
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="flex flex-col px-4 pb-6">
      {/* Header */}
      <header className="flex items-center justify-between px-1 pt-3">
        <div>
          <p className="text-sm font-medium text-black/50 dark:text-white/50">
            {todayLabel()}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
            Hola, Parce
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {/* ===== HERO: goal ring + net ===== */}
      <section className="flex flex-col items-center pt-6">
        <GoalRing progress={progress} net={net} />

        <div className="mt-6 flex items-center gap-2.5">
          <Pill
            icon={<ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />}
            label="Ingresos"
            value={formatCOP(gross)}
            tone="up"
          />
          <Pill
            icon={<ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.5} />}
            label="Gastos"
            value={formatCOP(expenses)}
            tone="down"
          />
        </div>

        <p className="mt-4 text-center text-sm font-medium text-black/45 dark:text-white/45">
          {remaining > 0 ? (
            <>
              Te faltan{" "}
              <span className="font-semibold text-[#1d1d1f] dark:text-white">
                {formatCOP(remaining)}
              </span>{" "}
              para tu meta
            </>
          ) : (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ¡Meta del día cumplida!
            </span>
          )}
        </p>
      </section>

      {/* ===== QUICK EVALUATOR (map hidden behind disclosure) ===== */}
      <div className="mt-7">
        <QuickEvaluator />
      </div>

      {/* ===== ACTION ZONE (thumb reachable) ===== */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <ActionButton
          onClick={onAddIncome}
          tone="income"
          icon={<Plus className="h-7 w-7" strokeWidth={2.5} />}
          label="Ingreso"
        />
        <ActionButton
          onClick={() => onAddExpense()}
          tone="expense"
          icon={<Minus className="h-7 w-7" strokeWidth={2.5} />}
          label="Gasto"
        />
      </div>

      {/* Ghost quick-tap */}
      <button
        onClick={() => onAddExpense("fantasma")}
        className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-rose-400/50 bg-rose-500/[0.04] py-3 text-sm font-semibold text-rose-600 transition active:scale-[0.98] dark:border-rose-400/40 dark:bg-rose-400/[0.06] dark:text-rose-300"
      >
        <Ghost className="h-4 w-4" strokeWidth={2} />
        Registrar gasto fantasma
      </button>

      {/* ===== SECONDARY DATA (below the fold) ===== */}
      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-black/35 dark:text-white/35">
        <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
        Resumen del día
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <ChannelCard transactions={transactions} />
        <StreakCard />

        {/* Ghost spend highlight */}
        <BentoCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-black/50 dark:text-white/50">
                Gastos fantasma hoy
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {formatCOP(ghost)}
              </p>
            </div>
            <p className="max-w-[9rem] text-right text-xs font-medium text-black/40 text-pretty dark:text-white/40">
              Fugas pequeñas que te comen la ganancia.
            </p>
          </div>
        </BentoCard>

        {/* Recent activity */}
        <section className="rounded-3xl border border-black/[0.06] bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#18181b] dark:shadow-none">
          <h2 className="px-4 py-3 text-[13px] font-semibold text-black/50 dark:text-white/50">
            Movimientos de hoy
          </h2>
          <ul>
            {transactions.map((tx, i) => {
              const Icon = iconForKind(tx.type, tx.kind)
              const isIncome = tx.type === "income"
              return (
                <li
                  key={tx.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    i !== transactions.length - 1 &&
                      "border-b border-black/[0.05] dark:border-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      isIncome
                        ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400"
                        : "bg-black/[0.05] text-black/60 dark:bg-white/[0.06] dark:text-white/60",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-[#1d1d1f] dark:text-white">
                      {tx.label}
                    </p>
                    <p className="text-xs font-medium text-black/40 dark:text-white/40">
                      {tx.time}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[15px] font-semibold tabular-nums",
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-black/50 dark:text-white/50",
                    )}
                  >
                    {isIncome ? "+" : "−"}
                    {formatCOP(tx.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Close shift */}
        <button
          onClick={onCloseShift}
          className="mt-1 w-full rounded-full border border-black/[0.08] bg-white py-4 text-base font-semibold text-[#1d1d1f] shadow-sm transition active:scale-[0.98] dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:shadow-none"
        >
          Cerrar Jornada
        </button>
      </div>
    </div>
  )
}

/* ---------- Hero goal ring ---------- */

function GoalRing({ progress, net }: { progress: number; net: number }) {
  const size = 232
  const stroke = 18
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (progress / 100) * c

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
          className="stroke-black/[0.06] dark:stroke-white/[0.08]"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-emerald-500 transition-[stroke-dashoffset] duration-700 ease-out dark:stroke-emerald-400"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-medium text-black/50 dark:text-white/50">
          Me quedó limpio
        </span>
        <span className="mt-1 text-[2.75rem] font-bold leading-none tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatCOP(net)}
        </span>
        <span className="mt-2 rounded-full bg-black/[0.05] px-2.5 py-1 text-xs font-semibold tabular-nums text-black/50 dark:bg-white/[0.08] dark:text-white/50">
          {progress}% de la meta
        </span>
      </div>
    </div>
  )
}

/* ---------- Stat pill ---------- */

function Pill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: "up" | "down"
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3.5 py-2 shadow-sm dark:border-white/10 dark:bg-[#18181b] dark:shadow-none">
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full",
          tone === "up"
            ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400"
            : "bg-black/[0.06] text-black/55 dark:bg-white/[0.08] dark:text-white/55",
        )}
      >
        {icon}
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-[11px] font-medium text-black/45 dark:text-white/45">
          {label}
        </span>
        <span className="mt-0.5 text-sm font-bold tabular-nums text-[#1d1d1f] dark:text-white">
          {value}
        </span>
      </div>
    </div>
  )
}

/* ---------- Big action button ---------- */

function ActionButton({
  onClick,
  tone,
  icon,
  label,
}: {
  onClick: () => void
  tone: "income" | "expense"
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-h-28 flex-col items-center justify-center gap-3 rounded-3xl border shadow-sm transition active:scale-[0.97]",
        tone === "income"
          ? "border-emerald-500/20 bg-emerald-500/[0.08] dark:border-emerald-400/20 dark:bg-emerald-400/[0.1] dark:shadow-none"
          : "border-black/[0.06] bg-white dark:border-white/10 dark:bg-[#18181b] dark:shadow-none",
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          tone === "income"
            ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black"
            : "bg-black/[0.06] text-[#1d1d1f] dark:bg-white/[0.08] dark:text-white",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-base font-bold",
          tone === "income"
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-[#1d1d1f] dark:text-white",
        )}
      >
        {label}
      </span>
    </button>
  )
}
