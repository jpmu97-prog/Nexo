"use client"

import { Radio, Flame } from "lucide-react"
import {
  WEEK_STREAK,
  channelBreakdown,
  formatCOP,
  type Transaction,
} from "@/lib/rutascore"
import { cn } from "@/lib/utils"

/* ---------- Rendimiento por Canal ---------- */

export function ChannelCard({ transactions }: { transactions: Transaction[] }) {
  const channels = channelBreakdown(transactions)
  const max = channels[0]?.total ?? 1

  return (
    <BentoCard className="col-span-2">
      <CardHeader icon={<Radio className="h-4 w-4" strokeWidth={2} />}>
        Rendimiento por canal
      </CardHeader>

      {channels.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-black/40 dark:text-white/40">
          Aún no registras ingresos hoy.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3.5">
          {channels.map((c) => (
            <li key={c.key} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] text-black/70 dark:bg-white/[0.06] dark:text-white/70">
                <c.icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">
                    {c.label}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-black/70 dark:text-white/70">
                    {formatCOP(c.total)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 dark:bg-emerald-400"
                    style={{ width: `${Math.round((c.total / max) * 100)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </BentoCard>
  )
}

/* ---------- Racha Semanal ---------- */

export function StreakCard() {
  const greenDays = WEEK_STREAK.filter((d) => d.met).length

  return (
    <BentoCard className="col-span-2">
      <div className="flex items-center justify-between">
        <CardHeader icon={<Flame className="h-4 w-4" strokeWidth={2} />}>
          Racha semanal
        </CardHeader>
        <span className="text-[13px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          {greenDays}/7 en verde
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {WEEK_STREAK.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                d.met
                  ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black dark:shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  : "bg-black/[0.05] text-black/30 dark:bg-white/[0.06] dark:text-white/30",
              )}
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </BentoCard>
  )
}

/* ---------- Shared shell ---------- */

export function BentoCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#18181b] dark:shadow-none",
        className,
      )}
    >
      {children}
    </section>
  )
}

function CardHeader({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-black/50 dark:text-white/50">
      {icon}
      {children}
    </p>
  )
}
