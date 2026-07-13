"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { ChevronDown, Loader2, Map as MapIcon, Zap } from "lucide-react"
import {
  MAP_ORIGIN,
  RENTABLE_BASELINE_PER_KM,
  destinationPoint,
  formatCOP,
  randomDistanceKm,
} from "@/lib/rutascore"
import { cn } from "@/lib/utils"

const MapInner = dynamic(() => import("@/components/rutascore/map-inner"), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

function MapSkeleton() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black/[0.03] dark:bg-white/[0.03]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-black/[0.02] via-transparent to-black/[0.04] dark:from-white/[0.02] dark:to-white/[0.04]" />
      <span className="flex items-center gap-2 text-xs font-medium text-black/40 dark:text-white/40">
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        Cargando mapa…
      </span>
    </div>
  )
}

/**
 * Frictionless order evaluator. Two big number inputs give an instant
 * profitability verdict; the route map is hidden behind progressive
 * disclosure so it never adds cognitive load when logging quickly.
 */
export function QuickEvaluator() {
  const [pay, setPay] = useState("")
  const [km, setKm] = useState("")
  const [mapOpen, setMapOpen] = useState(false)
  const [destPoint, setDestPoint] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(false)
  const [kmPulse, setKmPulse] = useState(false)

  const result = useMemo(() => {
    const p = Number(pay)
    const d = Number(km)
    if (!p || !d || p <= 0 || d <= 0) return null
    const perKm = p / d
    return { perKm, good: perKm >= RENTABLE_BASELINE_PER_KM }
  }, [pay, km])

  function handleCalculate() {
    if (loading) return
    setLoading(true)
    setDestPoint(null)
    setTimeout(() => {
      const dist = randomDistanceKm()
      const bearing = 20 + Math.random() * 320
      setDestPoint(destinationPoint(MAP_ORIGIN, dist, bearing))
      setKm(String(dist))
      setKmPulse(true)
      setTimeout(() => setKmPulse(false), 1600)
      setLoading(false)
    }, 850)
  }

  return (
    <section className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#18181b] dark:shadow-none">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-black/50 dark:text-white/50">
        <Zap className="h-4 w-4" strokeWidth={2} />
        ¿Vale la pena el pedido?
      </p>

      {/* Oversized inputs */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <BigField
          label="Pago ofrecido"
          prefix="$"
          value={pay}
          onChange={setPay}
          placeholder="0"
        />
        <BigField
          label="Km estimados"
          suffix="km"
          value={km}
          onChange={setKm}
          placeholder="0"
          allowDecimal
          highlight={kmPulse}
        />
      </div>

      {/* Instant verdict */}
      <div
        className={cn(
          "mt-3 flex items-center justify-between rounded-2xl px-4 py-3.5 transition-colors duration-300",
          !result
            ? "bg-black/[0.03] dark:bg-white/[0.04]"
            : result.good
              ? "bg-emerald-500/12 dark:bg-emerald-400/12"
              : "bg-rose-500/12 dark:bg-rose-400/12",
        )}
      >
        <div>
          <p className="text-[11px] font-medium text-black/40 dark:text-white/40">
            Rendimiento
          </p>
          <p className="text-xl font-bold tabular-nums text-[#1d1d1f] dark:text-white">
            {result ? formatCOP(result.perKm) : "—"}
            <span className="text-xs font-medium text-black/40 dark:text-white/40">
              {" "}
              /km
            </span>
          </p>
        </div>
        {result ? (
          <span
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold",
              result.good
                ? "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black"
                : "bg-rose-500 text-white dark:bg-rose-500 dark:text-white",
            )}
          >
            {result.good ? "¡Rentable!" : "Rechazar"}
          </span>
        ) : (
          <span className="text-xs font-medium text-black/40 dark:text-white/40">
            Ingresa pago y km
          </span>
        )}
      </div>

      {/* Progressive disclosure: route map */}
      <button
        onClick={() => setMapOpen((v) => !v)}
        aria-expanded={mapOpen}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-semibold text-black/50 transition active:scale-[0.98] dark:text-white/50"
      >
        <MapIcon className="h-4 w-4" strokeWidth={2} />
        {mapOpen ? "Ocultar mapa" : "Ver mapa de ruta"}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            mapOpen && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          mapOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 h-56 overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/10">
            <div className="absolute inset-0 z-0">
              <MapInner origin={MAP_ORIGIN} destination={destPoint} />
            </div>
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="absolute bottom-3 left-1/2 z-[1000] flex -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-60 dark:bg-emerald-400 dark:text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                  Calculando…
                </>
              ) : (
                "Calcular distancia"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function BigField({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  allowDecimal,
  highlight,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  prefix?: string
  suffix?: string
  allowDecimal?: boolean
  highlight?: boolean
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1 rounded-2xl bg-black/[0.03] px-4 py-3 transition-all duration-300 dark:bg-white/[0.04]",
        highlight &&
          "bg-emerald-500/10 ring-2 ring-emerald-500/60 dark:bg-emerald-400/10 dark:ring-emerald-400/60",
      )}
    >
      <span className="text-[11px] font-medium text-black/40 dark:text-white/40">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className="text-xl font-bold text-black/40 dark:text-white/40">
            {prefix}
          </span>
        )}
        <input
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(
              allowDecimal
                ? e.target.value.replace(/[^0-9.]/g, "")
                : e.target.value.replace(/[^0-9]/g, ""),
            )
          }
          className="w-full min-w-0 bg-transparent text-2xl font-bold tabular-nums text-[#1d1d1f] outline-none placeholder:text-black/25 dark:text-white dark:placeholder:text-white/25"
        />
        {suffix && (
          <span className="text-sm font-semibold text-black/40 dark:text-white/40">
            {suffix}
          </span>
        )}
      </div>
    </label>
  )
}
