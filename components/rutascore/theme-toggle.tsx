"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      aria-label={
        mounted
          ? isDark
            ? "Activar modo claro"
            : "Activar modo oscuro"
          : "Cambiar tema"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-black/[0.03] text-[#1d1d1f] transition active:scale-95 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70"
    >
      {mounted && !isDark ? (
        <Moon className="h-5 w-5" strokeWidth={2} />
      ) : (
        <Sun className="h-5 w-5" strokeWidth={2} />
      )}
    </button>
  )
}
