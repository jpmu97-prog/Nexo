"use client"

import { Home, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"

export type Tab = "hoy" | "historial" | "perfil"

const TABS: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: "hoy", label: "Hoy", icon: Home },
  { key: "historial", label: "Historial", icon: Clock },
  { key: "perfil", label: "Perfil", icon: User },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (t: Tab) => void
}) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/60">
      <ul className="mx-auto flex max-w-md items-center justify-around px-4 pb-6 pt-2">
        {TABS.map((tab) => {
          const isActive = tab.key === active
          return (
            <li key={tab.key}>
              <button
                onClick={() => onChange(tab.key)}
                className="flex flex-col items-center gap-1 px-4 py-1"
              >
                <tab.icon
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-black/40 dark:text-white/40",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors",
                    isActive
                      ? "text-[#1d1d1f] dark:text-white"
                      : "text-black/40 dark:text-white/40",
                  )}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
