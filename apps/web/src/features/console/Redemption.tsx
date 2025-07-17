import { useState } from 'react'
import { useConsoleStore } from './store'
import { showToast } from '../../lib/toast'

export default function Redemption() {
  const { redeemVoucher, redemptions } = useConsoleStore()
  const [creditCode, setCreditCode] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [redeemMsg, setRedeemMsg] = useState('')

  const redeem = async (code: string, type: 'credit' | 'coupon') => {
    if (!code.trim()) return
    const ok = await redeemVoucher(code.trim())
    const successMessage = type === 'credit'
      ? '额度兑换成功，已写入账户余额。'
      : '优惠券兑换成功，下次支付时可选择使用。'
    setRedeemMsg(ok ? successMessage : '兑换失败：代码不存在、已过期或已被使用。')
    showToast(ok ? (type === 'credit' ? '额度兑换成功' : '优惠券兑换成功') : '兑换失败', ok ? 'success' : 'error')
    if (ok && type === 'credit') setCreditCode('')
    if (ok && type === 'coupon') setCouponCode('')
    setTimeout(() => setRedeemMsg(''), 3200)
  }

  return (
    <div className="space-y-6">
      <section className="mb-2">
        <h1 className="mb-1 text-2xl font-medium text-primary">兑换中心</h1>
        <p className="max-w-2xl text-sm text-on-surface-variant">兑换码用于直接增加 Credit 额度；优惠券用于下次支付抵扣。两种代码分开输入，避免误操作。</p>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RedeemBox
          icon="redeem"
          title="兑换额度"
          desc="输入额度兑换码，成功后立即增加账户 Credit。"
          value={creditCode}
          onChange={setCreditCode}
          placeholder="例如 MNX-CREDIT-XXXX"
          button="兑换额度"
          onSubmit={() => void redeem(creditCode, 'credit')}
        />
        <RedeemBox
          icon="local_activity"
          title="兑换优惠券"
          desc="输入优惠券代码，成功后会保存到账户，下次支付可选择使用。"
          value={couponCode}
          onChange={setCouponCode}
          placeholder="例如 WELCOME10"
          button="兑换优惠券"
          onSubmit={() => void redeem(couponCode, 'coupon')}
        />
      </div>
      {redeemMsg && <p className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-primary">{redeemMsg}</p>}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-on-surface">兑换记录</h3>
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">日期</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">代码</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant">价值</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-on-surface-variant">状态</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-on-surface-variant">暂无兑换记录</td></tr>}
                {redemptions.map(entry => (
                  <tr key={entry.id} className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{entry.date}</td>
                    <td className="px-4 py-3 font-mono text-sm text-on-surface">{entry.code}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-green-600">{entry.amount > 0 ? `+${entry.amount} Credit` : '优惠券'}</td>
                    <td className="px-4 py-3 text-right text-sm text-tertiary">{entry.status === 'success' ? '成功' : entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

function RedeemBox(props: {
  icon: string
  title: string
  desc: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  button: string
  onSubmit: () => void
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary">{props.icon}</span>
        <div>
          <h2 className="text-lg font-medium text-primary">{props.title}</h2>
          <p className="text-sm text-on-surface-variant">{props.desc}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className="flex-1 rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={props.onSubmit} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary transition-all hover:bg-primary/90">
          {props.button}
        </button>
      </div>
    </div>
  )
}
