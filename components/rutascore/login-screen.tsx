"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

export function LoginScreen({
  onGoogleSignIn,
  error,
}: {
  onGoogleSignIn: () => Promise<void>
  error?: string | null
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await onGoogleSignIn()
    } finally {
      // If the redirect doesn't happen (error), re-enable the button
      setTimeout(() => setLoading(false), 4000)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      {/* Brand */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-black/[0.06] bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] dark:shadow-none">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            N
          </span>
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
          Nexo
        </h1>
        <p className="mt-3 max-w-[16rem] text-base leading-relaxed text-black/60 text-balance dark:text-white/60">
          No es cuánto hiciste. Es cuánto te quedó.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-12 w-full max-w-xs">
        <button
          onClick={handleClick}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-black/[0.08] bg-white py-4 text-base font-semibold text-[#1d1d1f] shadow-sm transition active:scale-[0.98] disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:shadow-none"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
          ) : (
            <GoogleIcon />
          )}
          Continuar con Google
        </button>

        {error ? (
          <p className="mt-4 text-center text-sm text-rose-600 dark:text-rose-400">
            {error}
          </p>
        ) : null}

        <p className="mt-6 text-center text-xs leading-relaxed text-black/40 dark:text-white/40">
          Tu jornada, tus domicilios y tus gastos se guardan de forma segura en
          tu cuenta.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.16-3.16A11 11 0 0 0 2.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52Z"
      />
    </svg>
  )
}
