import { useMemo } from 'react'
import { useConsoleStore } from './store'
import type { BillingEntry } from './types'
import ConsoleIcon from './ConsoleIcon'

type BillingRow = BillingEntry & {
  currency: string
  method: string
  status: string
}

function normalizeBilling(entries: BillingEntry[]): BillingRow[] {
  return entries.map((entry) => ({
    ...entry,
    currency: 'Credit',
    method: inferMethod(entry.description),
    status: entry.type === 'credit' ? 'Completed' : 'Pending',
  }))
}

function inferMethod(description: string) {
  const text = description.toLowerCase()
  if (text.includes('web3')) return 'Web3'
  if (text.includes('card')) return 'Card'
  if (text.includes('alipay')) return 'Alipay'
  if (text.includes('wechat')) return 'WeChat'
  return 'ModelNex Pay'
}

function inferType(description: string, amount: number) {
  const text = description.toLowerCase()
  if (text.includes('refund')) return 'Refund'
  if (text.includes('subscription')) return 'Subscription'
  if (text.includes('balance')) return 'Recharge'
  if (text.includes('api')) return 'API Credit'
  if (amount > 0) return 'Recharge'
  return 'Adjustment'
}

export default function Billing() {
  const { billing } = useConsoleStore()
  const rows = useMemo(() => normalizeBilling(billing), [billing])
  const completed = rows.filter((row) => row.status === 'Completed').length
  const creditTotal = rows.reduce((sum, row) => sum + (row.type === 'credit' ? row.amount : 0), 0)

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-medium text-primary">Billing History</h1>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">Recharge, subscription, refund, and adjustment records from Sub2API payment orders.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard label="Bills" value={String(rows.length)} icon="receipt_long" />
        <SummaryCard label="Completed" value={String(completed)} icon="check" />
        <SummaryCard label="Credit total" value={creditTotal.toLocaleString()} icon="payments" />
      </section>

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
        <div className="border-b border-outline-variant px-5 py-4">
          <h2 className="text-sm font-semibold text-primary">Order ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <Th>Billing ID</Th>
                <Th>Date / UTC</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Currency</Th>
                <Th>Payment Method</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-on-surface-variant">
                    No billing records returned by the backend yet.
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low/70">
                  <Td mono>{row.id}</Td>
                  <Td>{formatUtc(row.date)}</Td>
                  <Td>{inferType(row.description, row.amount)}</Td>
                  <Td strong className={row.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {row.amount >= 0 ? '+' : ''}{row.amount.toLocaleString()}
                  </Td>
                  <Td>{row.currency}</Td>
                  <Td>{row.method}</Td>
                  <Td>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{row.status}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</p>
        <ConsoleIcon name={icon} className="h-5 w-5 text-primary" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-primary">{value}</p>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{children}</th>
}

function Td({ children, mono, strong, className = '' }: { children: React.ReactNode; mono?: boolean; strong?: boolean; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${mono ? 'font-mono text-xs' : ''} ${strong ? 'font-semibold' : ''} ${className}`}>{children}</td>
}

function formatUtc(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '-'
  return date.toISOString()
}
