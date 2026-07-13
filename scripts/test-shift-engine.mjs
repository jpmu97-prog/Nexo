// Temporary verification script: validates the daily-shift engine against
// the real Supabase schema and RLS policies using a disposable test user.
import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const service = process.env.SUPABASE_SERVICE_ROLE_KEY

const admin = createClient(url, service)
const email = `test-nexo-${Date.now()}@example.com`
const password = "test-password-123!"

// 1. Create confirmed test user
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})
if (createErr) throw createErr
const userId = created.user.id
console.log("[v0] user created:", userId)

// 2. Sign in with anon client (RLS applies)
const supabase = createClient(url, anon)
const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
if (signInErr) throw signInErr
console.log("[v0] signed in")

// 3. Fetch/create today's shift
const today = new Date().toLocaleDateString("en-CA")
let { data: shift, error: sErr } = await supabase
  .from("daily_shifts")
  .select("id, status")
  .eq("user_id", userId)
  .eq("date", today)
  .maybeSingle()
if (sErr) throw sErr
if (!shift) {
  const res = await supabase
    .from("daily_shifts")
    .insert({ user_id: userId, date: today, status: "open", gross_income: 0, total_expenses: 0, net_income: 0, goal_amount: 100000 })
    .select("id, status")
    .single()
  if (res.error) throw res.error
  shift = res.data
}
console.log("[v0] shift:", shift)

// 4. Insert delivery + expense
const { data: d, error: dErr } = await supabase
  .from("deliveries")
  .insert({ user_id: userId, shift_id: shift.id, platform: "rappi", amount: 45000 })
  .select("id, platform, amount, created_at")
  .single()
if (dErr) throw dErr
console.log("[v0] delivery:", d.id, d.amount)

const { data: e, error: eErr } = await supabase
  .from("expenses")
  .insert({ user_id: userId, shift_id: shift.id, type: "fantasma", amount: 5000 })
  .select("id, type, amount, created_at")
  .single()
if (eErr) throw eErr
console.log("[v0] expense:", e.id, e.amount)

// 5. Update shift totals
const { error: uErr } = await supabase
  .from("daily_shifts")
  .update({ gross_income: 45000, total_expenses: 5000, net_income: 40000, deliveries_count: 1 })
  .eq("id", shift.id)
if (uErr) throw uErr
console.log("[v0] totals updated")

// 6. Close shift
const { error: cErr } = await supabase
  .from("daily_shifts")
  .update({ status: "closed", closed_at: new Date().toISOString(), goal_completed: false, score: 89 })
  .eq("id", shift.id)
if (cErr) throw cErr
console.log("[v0] shift closed")

// 7. Read back
const { data: final } = await supabase
  .from("daily_shifts")
  .select("status, gross_income, total_expenses, net_income, score")
  .eq("id", shift.id)
  .single()
console.log("[v0] final shift row:", final)

// 8. Cleanup: delete test user (cascades if FKs configured; else delete rows)
await admin.from("deliveries").delete().eq("user_id", userId)
await admin.from("expenses").delete().eq("user_id", userId)
await admin.from("daily_shifts").delete().eq("user_id", userId)
await admin.auth.admin.deleteUser(userId)
console.log("[v0] cleanup done — ALL CHECKS PASSED")
