"use client"

import { useState } from "react"
import { AmountSheet } from "@/components/rutascore/amount-sheet"
import { BottomNav, type Tab } from "@/components/rutascore/bottom-nav"
import { CloseShift } from "@/components/rutascore/close-shift"
import { Dashboard } from "@/components/rutascore/dashboard"
import { LoginScreen } from "@/components/rutascore/login-screen"
import { HistoryView, ProfileView } from "@/components/rutascore/other-views"
import { ToastProvider, useToast } from "@/components/rutascore/toast"
import { useShift } from "@/hooks/use-shift"
import {
  toastLabelForKind,
  xpForTransaction,
  type TxType,
} from "@/lib/rutascore"

export default function Page() {
  return (
    <ToastProvider>
      <PageContent />
    </ToastProvider>
  )
}

function PageContent() {
  const toast = useToast()
  const {
    currentUser,
    authLoading,
    signInWithGoogle,
    signOut,
    isLoading,
    error,
    transactions,
    gross,
    expenses,
    net,
    handleAddIncome,
    handleAddExpense,
    handleCloseShift,
  } = useShift()

  const [tab, setTab] = useState<Tab>("hoy")
  const [sheet, setSheet] = useState<TxType | null>(null)
  const [sheetKind, setSheetKind] = useState<string | undefined>(undefined)
  const [closing, setClosing] = useState(false)

  const openIncome = () => {
    setSheetKind(undefined)
    setSheet("income")
  }
  const openExpense = (kind?: string) => {
    setSheetKind(kind)
    setSheet("expense")
  }

  const handleSave = async (amount: number, kind: string, _label: string) => {
    if (!sheet) return
    const type = sheet
    setSheet(null)
    const ok =
      type === "income"
        ? await handleAddIncome(amount, kind)
        : await handleAddExpense(amount, kind)
    if (ok) {
      toast({
        message: toastLabelForKind(type, kind),
        xp: xpForTransaction(type, kind),
      })
    }
  }

  const handleShiftClose = () => {
    setClosing(true)
    handleCloseShift()
  }

  return (
    <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      {authLoading ? (
        <LoadingScreen />
      ) : !currentUser ? (
        <LoginScreen onGoogleSignIn={signInWithGoogle} error={error} />
      ) : (
        <>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pb-24">
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <>
                {tab === "hoy" && (
                  <Dashboard
                    transactions={transactions ?? []}
                    gross={gross}
                    expenses={expenses}
                    net={net}
                    onAddIncome={openIncome}
                    onAddExpense={openExpense}
                    onCloseShift={handleShiftClose}
                  />
                )}
                {tab === "historial" && <HistoryView />}
                {tab === "perfil" && <ProfileView onSignOut={signOut} />}
              </>
            )}
          </div>

          <BottomNav active={tab} onChange={setTab} />

          <AmountSheet
            open={sheet !== null}
            type={sheet ?? "income"}
            initialKind={sheetKind}
            onClose={() => setSheet(null)}
            onSave={handleSave}
          />

          <CloseShift
            open={closing}
            gross={gross}
            expenses={expenses}
            net={net}
            onClose={() => setClosing(false)}
          />
        </>
      )}
    </main>
  )
}

/* ---------- Glassmorphic loading states ---------- */

function LoadingScreen() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-black/10 border-t-emerald-500 dark:border-white/10 dark:border-t-emerald-400" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse px-5 pt-14" aria-hidden="true">
      {/* Hero ring */}
      <div className="flex flex-col items-center">
        <div className="h-52 w-52 rounded-full border border-black/[0.06] bg-black/[0.04] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]" />
        <div className="mt-5 flex gap-3">
          <div className="h-8 w-28 rounded-full bg-black/[0.05] dark:bg-white/[0.06]" />
          <div className="h-8 w-28 rounded-full bg-black/[0.05] dark:bg-white/[0.06]" />
        </div>
      </div>
      {/* Evaluator card */}
      <div className="mt-8 h-40 rounded-3xl border border-black/[0.06] bg-black/[0.04] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]" />
      {/* Action buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-16 rounded-3xl bg-black/[0.05] dark:bg-white/[0.06]" />
        <div className="h-16 rounded-3xl bg-black/[0.05] dark:bg-white/[0.06]" />
      </div>
      <div className="mt-3 h-12 rounded-3xl bg-black/[0.05] dark:bg-white/[0.06]" />
    </div>
  )
}
