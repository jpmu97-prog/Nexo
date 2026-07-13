"use client"

import { useEffect, useState } from "react"
import { Delete, X } from "lucide-react"
import {
  EXPENSE_CATEGORIES,
  INCOME_PLATFORMS,
  formatCOP,
  type TxType,
} from "@/lib/rutascore"
import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  type: TxType
  initialKind?: string
  onClose: () => void
  onSave: (amount: number, kind: string, label: string) => void
}

export function AmountSheet({ open, type, initialKind, onClose, onSave }: Props) {
  const options = type === "income" ? INCOME_PLATFORMS : EXPENSE_CATEGORIES
  const [amount, setAmount] = useState(0)
  const [kind, setKind] = useState(options[0].key)

  useEffect(() => {
    if (open) {
      setAmount(0)
      const valid = options.some((o) => o.key === initialKind)
      setKind(valid ? (initialKind as string) : options[0].key)
    }
  }, [open, type, initialKind]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const press = (digit: string) => {
    setAmount((prev) => {
      const next = prev * 10 + Number(digit)
      return next > 99_999_999 ? prev : next
    })
  }
  const backspace = () => setAmount((prev) => Math.floor(prev / 10))

  const title = type === "income" ? "¿Cuánto te hiciste?" : "¿En qué se te fue?"
  const selected = options.find((o) => o.key === kind)!

  const handleSave = () => {
    if (amount <= 0) return
    onSave(amount, kind, selected.label)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Scrim */}
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-lg animate-in fade-in duration-200"
      />

      {/* Sheet */}
      <div className="relative rounded-t-[2rem] border-t border-black/[0.06] bg-white/90 px-5 pb-8 pt-3 shadow-[0_-8px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl animate-in slide-in-from-bottom duration-300 dark:border-white/10 dark:bg-[#141416]/95 dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/15 dark:bg-white/20" />

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-black/50 active:scale-95 dark:bg-white/10 dark:text-white/60"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Amount display */}
        <div className="mb-6 text-center">
          <span
            className={cn(
              "text-5xl font-bold tracking-tight tabular-nums",
              amount > 0
                ? type === "income"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-[#1d1d1f] dark:text-white"
                : "text-black/25 dark:text-white/25",
            )}
          >
            {formatCOP(amount)}
          </span>
        </div>

        {/* Selector pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {options.map((opt) => {
            const active = opt.key === kind
            const isGhost = "highlight" in opt && opt.highlight
            return (
              <button
                key={opt.key}
                onClick={() => setKind(opt.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors active:scale-95",
                  active
                    ? "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-black"
                    : isGhost
                      ? "border-dashed border-rose-400/60 bg-black/[0.03] text-rose-600 dark:bg-white/[0.04] dark:text-rose-300"
                      : "border-black/[0.08] bg-black/[0.03] text-black/70 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70",
                )}
              >
                <opt.icon className="h-4 w-4" strokeWidth={2} />
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Keypad */}
        <div className="mb-5 grid grid-cols-3 gap-2.5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <KeypadKey key={d} onClick={() => press(d)}>
              {d}
            </KeypadKey>
          ))}
          <KeypadKey onClick={() => setAmount((p) => (p * 1000 > 99_999_999 ? p : p * 1000))}>
            <span className="text-lg font-semibold">000</span>
          </KeypadKey>
          <KeypadKey onClick={() => press("0")}>0</KeypadKey>
          <KeypadKey onClick={backspace}>
            <Delete className="h-6 w-6" strokeWidth={2} />
          </KeypadKey>
        </div>

        <button
          onClick={handleSave}
          disabled={amount <= 0}
          className={cn(
            "w-full rounded-full py-4 text-base font-semibold transition active:scale-[0.98] disabled:opacity-40",
            type === "income"
              ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black"
              : "bg-[#1d1d1f] text-white dark:bg-white dark:text-black",
          )}
        >
          Guardar
        </button>
      </div>
    </div>
  )
}

function KeypadKey({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-14 items-center justify-center rounded-2xl border border-black/[0.06] bg-black/[0.03] text-2xl font-semibold text-[#1d1d1f] transition active:scale-95 active:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:active:bg-white/10"
    >
      {children}
    </button>
  )
}
