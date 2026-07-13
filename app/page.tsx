"use client"

import { useMemo, useState } from "react"
import { AmountSheet } from "@/components/rutascore/amount-sheet"
import { BottomNav, type Tab } from "@/components/rutascore/bottom-nav"
import { CloseShift } from "@/components/rutascore/close-shift"
import { Dashboard } from "@/components/rutascore/dashboard"
import { HistoryView, ProfileView } from "@/components/rutascore/other-views"
import { ToastProvider, useToast } from "@/components/rutascore/toast"
import {
  INITIAL_TRANSACTIONS,
  toastLabelForKind,
  xpForTransaction,
  type Transaction,
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
  const [tab, setTab] = useState<Tab>("hoy")
  const [transactions, setTransactions] = useState<Transaction[]>(
    INITIAL_TRANSACTIONS,
  )
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

  const { gross, expenses, net } = useMemo(() => {
    const gross = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0)
    return { gross, expenses, net: gross - expenses }
  }, [transactions])

  const handleSave = (amount: number, kind: string, label: string) => {
    if (!sheet) return
    const now = new Date().toLocaleTimeString("es-CO", {
      hour: "numeric",
      minute: "2-digit",
    })
    setTransactions((prev) => [
      {
        id: crypto.randomUUID(),
        type: sheet,
        amount,
        kind,
        label,
        time: now,
      },
      ...prev,
    ])
    toast({
      message: toastLabelForKind(sheet, kind),
      xp: xpForTransaction(sheet, kind),
    })
    setSheet(null)
  }

  return (
    <main className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#0a0a0a]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {tab === "hoy" && (
          <Dashboard
            transactions={transactions}
            gross={gross}
            expenses={expenses}
            net={net}
            onAddIncome={openIncome}
            onAddExpense={openExpense}
            onCloseShift={() => setClosing(true)}
          />
        )}
        {tab === "historial" && <HistoryView />}
        {tab === "perfil" && <ProfileView />}
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
    </main>
  )
}
