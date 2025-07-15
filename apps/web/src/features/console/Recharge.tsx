import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConsoleStore } from './store'
import ConsoleIcon from './ConsoleIcon'

const MIN_RECHARGE_AMOUNT = 0.01

export default function Recharge() {
  const navigate = useNavigate()
  const { balance, plan, billing, subscription, resetSubscriptionUsage } = useConsoleStore()
  const [selectedAmount, setSelectedAmount] = useState(500)
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('web3')
  const rechargeOptions = [100, 500, 1000, 5000]
  const actualAmount = customAmount ? Number(customAmount) : selectedAmount
  const canPay = Number.isFinite(actualAmount) && actualAmount >= MIN_RECHARGE_AMOUNT

  function normalizeCustomAmount(value: string) {
    const cleaned = value.replace(/[^\d.]/g, '')
    const firstDot = cleaned.indexOf('.')
    const decimalNormalized = firstDot >= 0
      ? `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, '')}`
      : cleaned
    const [integerPart, decimalPart = ''] = decimalNormalized.split('.')
    const integer = integerPart.replace(/^0+(?=\d)/, '')
    const decimals = decimalPart.slice(0, 2)
    return decimalNormalized.includes('.') ? `${integer || '0'}.${decimals}` : integer
  }

  function handlePay() {
    if (!canPay) return
    navigate('/payment', {
      state: {
        kind: 'api-credit',
        amount: Number(actualAmount.toFixed(2)),
        method: paymentMethod,
        returnTo: '/console/recharge',
      },
    })
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-medium text-primary">Recharge</h1>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">Buy API credit through the unified ModelNex payment page.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Current plan</h2>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-medium text-primary">{plan}</span>
            <span className="text-sm text-on-surface-variant">{subscription.status === 'active' ? subscription.billingCycle || 'Active' : 'No active subscription'}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
            <li>5h quota: {subscription.used5h.toLocaleString()} / {subscription.quota5h.toLocaleString()} Credit</li>
            <li>Weekly quota: {subscription.usedWeekly.toLocaleString()} / {subscription.quotaWeekly.toLocaleString()} Credit</li>
          </ul>
          <button onClick={() => void resetSubscriptionUsage()} className="mt-5 rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant hover:text-primary">
            Refresh plan usage
          </button>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Current balance</h2>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-medium text-primary">{balance.toFixed(2)}</span>
            <span className="text-sm text-on-surface-variant">Credit</span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface p-5">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-medium text-primary">Buy API credit</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Select an amount and payment method, then continue to checkout.</p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Amount</p>
            <p className="text-2xl font-medium text-primary">{canPay ? actualAmount.toFixed(2) : '0.00'} Credit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-on-surface-variant">Credit amount</label>
            <div className="grid grid-cols-2 gap-2">
              {rechargeOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setSelectedAmount(amount); setCustomAmount('') }}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${!customAmount && selectedAmount === amount ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:text-primary'}`}
                >
                  {amount.toLocaleString()} Credit
                </button>
              ))}
            </div>
            <input
              value={customAmount}
              onChange={(event) => setCustomAmount(normalizeCustomAmount(event.target.value))}
              inputMode="decimal"
              className="mn-input mt-2 w-full"
              placeholder="Minimum 0.01"
            />
            {customAmount && !canPay && <p className="mt-1 text-xs text-red-600">Minimum recharge amount is 0.01 Credit.</p>}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-on-surface-variant">Payment method</label>
            <div className="space-y-2">
              {[
                ['web3', 'Web3 wallet', 'payments'],
                ['card', 'Bank card', 'payments'],
                ['alipay', 'Alipay', 'payments'],
                ['wechat', 'WeChat Pay', 'payments'],
              ].map(([id, label, icon]) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${paymentMethod === id ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:text-primary'}`}
                >
                  <ConsoleIcon name={icon} className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">Checkout</p>
              <p className="mt-1 text-3xl font-medium text-primary">{canPay ? actualAmount.toFixed(2) : '0.00'}</p>
              <p className="mt-1 text-sm text-on-surface-variant">Credit</p>
            </div>
            <button disabled={!canPay} onClick={handlePay} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              Continue to pay
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
        <div className="border-b border-outline-variant px-5 py-4">
          <h2 className="text-sm font-semibold text-primary">Recent payment orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {billing.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-on-surface-variant">No payment orders yet.</td></tr>
              ) : billing.slice(0, 8).map((entry) => (
                <tr key={entry.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <Td>{entry.date}</Td>
                  <Td>{entry.description}</Td>
                  <Td className={entry.amount > 0 ? 'text-green-600' : 'text-red-600'}>{entry.amount > 0 ? '+' : ''}{entry.amount} Credit</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-on-surface-variant ${className}`}>{children}</td>
}
