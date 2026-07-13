"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type ToastPayload = {
  message: string
  xp?: number
}

type ToastState = ToastPayload & { id: number; leaving: boolean }

const ToastContext = createContext<(t: ToastPayload) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)

  const show = useCallback((payload: ToastPayload) => {
    setToast({ ...payload, id: Date.now(), leaving: false })
  }, [])

  useEffect(() => {
    if (!toast || toast.leaving) return
    const hideTimer = setTimeout(() => {
      setToast((t) => (t ? { ...t, leaving: true } : t))
    }, 2000)
    return () => clearTimeout(hideTimer)
  }, [toast])

  useEffect(() => {
    if (!toast?.leaving) return
    const removeTimer = setTimeout(() => setToast(null), 280)
    return () => clearTimeout(removeTimer)
  }, [toast?.leaving])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-2.5 shadow-lg backdrop-blur-xl",
              "border-black/[0.08] bg-white/80 dark:border-white/15 dark:bg-[#18181b]/80",
              toast.leaving
                ? "animate-out fade-out slide-out-to-top-2 duration-300"
                : "animate-in fade-in slide-in-from-top-3 duration-300",
            )}
            role="status"
            aria-live="polite"
          >
            <span className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
              {toast.message}
            </span>
            {typeof toast.xp === "number" && (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.35)] dark:bg-emerald-400/15 dark:text-emerald-400">
                +{toast.xp} XP
              </span>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}
