import type { LucideIcon } from "lucide-react"
import {
  Bike,
  Car,
  Fuel,
  Ghost,
  UtensilsCrossed,
  Wrench,
  User,
  Package,
} from "lucide-react"

export type TxType = "income" | "expense"

export type Transaction = {
  id: string
  type: TxType
  amount: number
  label: string
  /** platform key for income, category key for expense */
  kind: string
  time: string
}

export type IncomePlatform = {
  key: string
  label: string
  icon: LucideIcon
}

export type ExpenseCategory = {
  key: string
  label: string
  icon: LucideIcon
  highlight?: boolean
}

export const INCOME_PLATFORMS: IncomePlatform[] = [
  { key: "rappi", label: "Rappi", icon: Bike },
  { key: "didi", label: "DiDi", icon: Car },
  { key: "particular", label: "Particular", icon: User },
  { key: "otro", label: "Otro", icon: Package },
]

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { key: "gasolina", label: "Gasolina", icon: Fuel },
  { key: "comida", label: "Comida", icon: UtensilsCrossed },
  { key: "fantasma", label: "Gasto Fantasma", icon: Ghost, highlight: true },
  { key: "mantenimiento", label: "Mantenimiento", icon: Wrench },
]

export function iconForKind(type: TxType, kind: string): LucideIcon {
  if (type === "income") {
    return INCOME_PLATFORMS.find((p) => p.key === kind)?.icon ?? Package
  }
  return EXPENSE_CATEGORIES.find((c) => c.key === kind)?.icon ?? Ghost
}

export const DAILY_GOAL = 100000

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "income", amount: 45000, label: "Rappi", kind: "rappi", time: "1:20 p.m." },
  { id: "t2", type: "expense", amount: 20000, label: "Gasolina", kind: "gasolina", time: "12:05 p.m." },
  { id: "t3", type: "income", amount: 60000, label: "Rappi", kind: "rappi", time: "11:30 a.m." },
  { id: "t4", type: "expense", amount: 5000, label: "Gasto Fantasma", kind: "fantasma", time: "10:50 a.m." },
  { id: "t5", type: "income", amount: 15000, label: "DiDi", kind: "didi", time: "10:10 a.m." },
  { id: "t6", type: "expense", amount: 28000, label: "Comida", kind: "comida", time: "9:15 a.m." },
]

/** Colombian peso formatting: $67.000 */
export function formatCOP(value: number): string {
  return "$" + Math.round(value).toLocaleString("es-CO")
}

export function todayLabel(): string {
  const d = new Date()
  const s = d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Baseline for order evaluator: minimum COP per km to be worth it. */
export const RENTABLE_BASELINE_PER_KM = 1000

/* ---------- Gamification ---------- */

/** XP awarded for logging a transaction (rewards the habit of control). */
export function xpForTransaction(type: TxType, kind: string): number {
  if (type === "expense") {
    // Logging tiny "ghost" leaks is the behavior we reward most.
    return kind === "fantasma" ? 8 : 5
  }
  return 6
}

/** Copy shown in the micro-feedback toast when logging. */
export function toastLabelForKind(type: TxType, kind: string): string {
  if (type === "expense") {
    if (kind === "fantasma") return "Gasto fantasma registrado"
    const cat = EXPENSE_CATEGORIES.find((c) => c.key === kind)
    return `${cat?.label ?? "Gasto"} registrado`
  }
  const plat = INCOME_PLATFORMS.find((p) => p.key === kind)
  return `Ingreso de ${plat?.label ?? "viaje"} sumado`
}

/** Current consecutive-day streak (days closed "en verde"). */
export const CURRENT_STREAK = 3
export const STREAK_XP_PER_DAY = 10

export type Badge = {
  key: string
  label: string
  description: string
}

/** Badges unlocked at close-shift, evaluated from the day's numbers. */
export function earnedBadges(gross: number, ghost: number): Badge[] {
  const badges: Badge[] = []
  // "Sin Fantasmas" — logged small leaks instead of ignoring them.
  if (ghost > 0) {
    badges.push({
      key: "sin-fantasmas",
      label: "Sin Fantasmas",
      description: "Registraste tus fugas pequeñas",
    })
  }
  // "Km Rentable" — kept a healthy earnings level.
  if (gross >= 80000) {
    badges.push({
      key: "km-rentable",
      label: "Km Rentable",
      description: "Mantuviste un buen $/km",
    })
  }
  return badges
}

/** Last 7 days: whether the daily net goal was met ("día en verde"). */
export type StreakDay = { label: string; met: boolean }

export const WEEK_STREAK: StreakDay[] = [
  { label: "L", met: true },
  { label: "M", met: false },
  { label: "M", met: true },
  { label: "J", met: true },
  { label: "V", met: false },
  { label: "S", met: true },
  { label: "D", met: true },
]

/** Route point for the map: a delivery stop with its earnings. */
export type RoutePoint = {
  lat: number
  lng: number
  label: string
  amount: number
}

/** Sample delivery route (Bogotá) — a day's worth of stops. */
export const ROUTE_POINTS: RoutePoint[] = [
  { lat: 4.6486, lng: -74.0819, label: "Inicio · Chapinero", amount: 0 },
  { lat: 4.6605, lng: -74.0546, label: "Rappi · Zona T", amount: 45000 },
  { lat: 4.6725, lng: -74.0489, label: "DiDi · Chicó", amount: 15000 },
  { lat: 4.688, lng: -74.0508, label: "Rappi · Usaquén", amount: 60000 },
  { lat: 4.7011, lng: -74.0402, label: "Última entrega", amount: 32000 },
]

/** Default map origin for the route calculator (Bogotá · Chapinero). */
export const MAP_ORIGIN: [number, number] = [4.6533, -74.0836]

/** Simulated geocoded distance for the prototype: 2.5 km – 12.0 km. */
export function randomDistanceKm(): number {
  return Math.round((2.5 + Math.random() * 9.5) * 10) / 10
}

/** Forward geodesic: point at `distanceKm` and `bearingDeg` from an origin. */
export function destinationPoint(
  [lat, lng]: [number, number],
  distanceKm: number,
  bearingDeg: number,
): [number, number] {
  const R = 6371
  const d = distanceKm / R
  const brng = (bearingDeg * Math.PI) / 180
  const lat1 = (lat * Math.PI) / 180
  const lng1 = (lng * Math.PI) / 180
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    )
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI]
}

/** Total distance of the route in km (haversine sum). */
export function routeDistanceKm(points: RoutePoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1], points[i])
  }
  return Math.round(total * 10) / 10
}

function haversineKm(a: RoutePoint, b: RoutePoint): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Sum today's income grouped by platform, sorted desc. */
export function channelBreakdown(transactions: Transaction[]) {
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== "income") continue
    totals.set(t.kind, (totals.get(t.kind) ?? 0) + t.amount)
  }
  return INCOME_PLATFORMS.map((p) => ({
    key: p.key,
    label: p.label,
    icon: p.icon,
    total: totals.get(p.key) ?? 0,
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
}
