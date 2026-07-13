"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import {
  DAILY_GOAL,
  EXPENSE_CATEGORIES,
  INCOME_PLATFORMS,
  type Transaction,
} from "@/lib/rutascore"

/* ---------- DB row types ---------- */

type ShiftRow = {
  id: string
  date: string
  status: "open" | "closed"
  gross_income: number | null
  total_expenses: number | null
  net_income: number | null
  goal_completed: boolean | null
  goal_amount: number | null
}

type DeliveryRow = {
  id: string
  platform: string
  amount: number
  created_at: string
}

type ExpenseRow = {
  id: string
  type: string
  amount: number
  created_at: string
}

/* ---------- Helpers ---------- */

/** Local date in Bogotá as yyyy-mm-dd (en-CA gives ISO format). */
function todayISO(): string {
  return new Date().toLocaleDateString("en-CA")
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function deliveryToTx(d: DeliveryRow): Transaction {
  const plat = INCOME_PLATFORMS.find((p) => p.key === d.platform)
  return {
    id: d.id,
    type: "income",
    amount: Number(d.amount),
    kind: d.platform,
    label: plat?.label ?? d.platform,
    time: timeLabel(d.created_at),
  }
}

function expenseToTx(e: ExpenseRow): Transaction {
  const cat = EXPENSE_CATEGORIES.find((c) => c.key === e.type)
  return {
    id: e.id,
    type: "expense",
    amount: Number(e.amount),
    kind: e.type,
    label: cat?.label ?? e.type,
    time: timeLabel(e.created_at),
  }
}

/* ---------- Hook ---------- */

export function useShift() {
  const supabase = useMemo(() => createClient(), [])

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentShiftId, setCurrentShiftId] = useState<string | null>(null)
  const [shiftStatus, setShiftStatus] = useState<"open" | "closed">("open")
  // CRITICAL: always initialized as [] so .map() never crashes while loading
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dailyGoal, setDailyGoal] = useState<number>(DAILY_GOAL)

  // Avoid duplicate fetches from onAuthStateChange firing multiple times
  const fetchedForUser = useRef<string | null>(null)

  /* ----- Auth ----- */

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setCurrentUser(data.user ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setCurrentUser(session?.user ?? null)
      setAuthLoading(false)
      if (!session?.user) {
        fetchedForUser.current = null
        setCurrentShiftId(null)
        setTransactions([])
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  /* ----- Daily shift engine ----- */

  const fetchTodayShift = useCallback(
    async (userId: string) => {
      setIsLoading(true)
      setError(null)
      try {
        // Profile → daily goal
        const { data: profile } = await supabase
          .from("profiles")
          .select("daily_goal")
          .eq("id", userId)
          .maybeSingle()
        if (profile?.daily_goal) setDailyGoal(Number(profile.daily_goal))

        // Today's shift (create if missing)
        const today = todayISO()
        const { data: existing, error: shiftErr } = await supabase
          .from("daily_shifts")
          .select(
            "id, date, status, gross_income, total_expenses, net_income, goal_completed, goal_amount",
          )
          .eq("user_id", userId)
          .eq("date", today)
          .maybeSingle<ShiftRow>()
        if (shiftErr) throw shiftErr

        let shift = existing
        if (!shift) {
          const { data: created, error: insertErr } = await supabase
            .from("daily_shifts")
            .insert({
              user_id: userId,
              date: today,
              status: "open",
              gross_income: 0,
              total_expenses: 0,
              net_income: 0,
              goal_amount: profile?.daily_goal ?? DAILY_GOAL,
            })
            .select(
              "id, date, status, gross_income, total_expenses, net_income, goal_completed, goal_amount",
            )
            .single<ShiftRow>()
          if (insertErr) throw insertErr
          shift = created
        }

        setCurrentShiftId(shift.id)
        setShiftStatus(shift.status)

        // Deliveries + expenses for this shift, in parallel
        const [{ data: deliveries, error: dErr }, { data: expenses, error: eErr }] =
          await Promise.all([
            supabase
              .from("deliveries")
              .select("id, platform, amount, created_at")
              .eq("shift_id", shift.id)
              .order("created_at", { ascending: false }),
            supabase
              .from("expenses")
              .select("id, type, amount, created_at")
              .eq("shift_id", shift.id)
              .order("created_at", { ascending: false }),
          ])
        if (dErr) throw dErr
        if (eErr) throw eErr

        // Merge sorted by created_at desc (both lists already desc)
        const merged: Transaction[] = []
        const dList = (deliveries ?? []).map((d) => ({
          tx: deliveryToTx(d),
          at: d.created_at,
        }))
        const eList = (expenses ?? []).map((e) => ({
          tx: expenseToTx(e),
          at: e.created_at,
        }))
        let i = 0
        let j = 0
        while (i < dList.length || j < eList.length) {
          if (
            j >= eList.length ||
            (i < dList.length && dList[i].at >= eList[j].at)
          ) {
            merged.push(dList[i++].tx)
          } else {
            merged.push(eList[j++].tx)
          }
        }
        setTransactions(merged)
      } catch (err) {
        console.error("[v0] fetchTodayShift error:", err)
        setError(err instanceof Error ? err.message : "Error cargando jornada")
      } finally {
        setIsLoading(false)
      }
    },
    [supabase],
  )

  useEffect(() => {
    if (currentUser && fetchedForUser.current !== currentUser.id) {
      fetchedForUser.current = currentUser.id
      fetchTodayShift(currentUser.id)
    }
  }, [currentUser, fetchTodayShift])

  /* ----- Derived totals (bound to fetched data) ----- */

  const { gross, expenses, net } = useMemo(() => {
    const gross = (transactions ?? [])
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0)
    const expenses = (transactions ?? [])
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0)
    return { gross, expenses, net: gross - expenses }
  }, [transactions])

  /* ----- Shift totals sync ----- */

  const syncShiftTotals = useCallback(
    async (txs: Transaction[]) => {
      if (!currentShiftId) return
      const g = txs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0)
      const e = txs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0)
      const { error } = await supabase
        .from("daily_shifts")
        .update({
          gross_income: g,
          total_expenses: e,
          net_income: g - e,
          deliveries_count: txs.filter((t) => t.type === "income").length,
        })
        .eq("id", currentShiftId)
      if (error) console.error("[v0] syncShiftTotals error:", error)
    },
    [supabase, currentShiftId],
  )

  /* ----- CRUD handlers ----- */

  const handleAddIncome = useCallback(
    async (amount: number, platform: string): Promise<boolean> => {
      if (!currentUser || !currentShiftId) return false
      const { data, error } = await supabase
        .from("deliveries")
        .insert({
          user_id: currentUser.id,
          shift_id: currentShiftId,
          platform,
          amount,
        })
        .select("id, platform, amount, created_at")
        .single<DeliveryRow>()
      if (error || !data) {
        console.error("[v0] handleAddIncome error:", error)
        setError(error?.message ?? "No se pudo guardar el ingreso")
        return false
      }
      setTransactions((prev) => {
        const next = [deliveryToTx(data), ...(prev ?? [])]
        syncShiftTotals(next)
        return next
      })
      return true
    },
    [supabase, currentUser, currentShiftId, syncShiftTotals],
  )

  const handleAddExpense = useCallback(
    async (amount: number, type: string): Promise<boolean> => {
      if (!currentUser || !currentShiftId) return false
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          user_id: currentUser.id,
          shift_id: currentShiftId,
          type,
          amount,
        })
        .select("id, type, amount, created_at")
        .single<ExpenseRow>()
      if (error || !data) {
        console.error("[v0] handleAddExpense error:", error)
        setError(error?.message ?? "No se pudo guardar el gasto")
        return false
      }
      setTransactions((prev) => {
        const next = [expenseToTx(data), ...(prev ?? [])]
        syncShiftTotals(next)
        return next
      })
      return true
    },
    [supabase, currentUser, currentShiftId, syncShiftTotals],
  )

  const handleCloseShift = useCallback(async (): Promise<void> => {
    if (!currentShiftId) return
    const score =
      gross > 0 ? Math.max(0, Math.min(100, Math.round((net / gross) * 100))) : 0
    const { error } = await supabase
      .from("daily_shifts")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        gross_income: gross,
        total_expenses: expenses,
        net_income: net,
        goal_completed: net >= dailyGoal,
        score,
      })
      .eq("id", currentShiftId)
    if (error) {
      console.error("[v0] handleCloseShift error:", error)
      setError(error.message)
      return
    }
    setShiftStatus("closed")
  }, [supabase, currentShiftId, gross, expenses, net, dailyGoal])

  return {
    // auth
    currentUser,
    authLoading,
    signInWithGoogle,
    signOut,
    // shift
    currentShiftId,
    shiftStatus,
    isLoading,
    error,
    transactions: transactions ?? [],
    gross,
    expenses,
    net,
    dailyGoal,
    // actions
    handleAddIncome,
    handleAddExpense,
    handleCloseShift,
  }
}
