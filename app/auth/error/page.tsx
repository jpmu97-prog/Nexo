import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#f8f9fa] px-8 text-center dark:bg-[#0a0a0a]">
      <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] dark:text-white">
        No pudimos iniciar sesión
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-black/60 dark:text-white/60">
        Hubo un problema con la autenticación. Intenta de nuevo.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition active:scale-[0.98] dark:bg-emerald-400 dark:text-black"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
