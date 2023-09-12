import { useMemo, useState } from 'react'
import { useConsoleStore } from './store'
import { showToast } from '../../lib/toast'
import ConsoleIcon from './ConsoleIcon'

export default function Referrals() {
  const { referrals, balance, profile, redeemInviteCode, hydrateFromServer } = useConsoleStore()
  const [inviteCode, setInviteCode] = useState('')
  const [busy, setBusy] = useState(false)
  const referralLink = useMemo(() => {
    if (!profile.inviteCode) return ''
    return `${window.location.origin}/ref/${encodeURIComponent(profile.inviteCode)}`
  }, [profile.inviteCode])
  const activeReferrals = referrals.filter((item) => item.status === 'active').length
  const totalReward = referrals.reduce((sum, item) => sum + item.reward, 0)

  async function copyText(text: string) {
    if (!text) return
    await navigator.clipboard.writeText(text)
    showToast('Copied')
  }

  async function bindInviteCode() {
    const code = inviteCode.trim()
    if (!code) {
      showToast('Invite code is required', 'error')
      return
    }
    setBusy(true)
    const ok = await redeemInviteCode(code)
    setBusy(false)
    showToast(ok ? 'Invite code bound' : 'Failed to bind invite code', ok ? 'success' : 'error')
    if (ok) setInviteCode('')
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-medium text-primary">Referrals</h1>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">Invite users, track referral rewards, and transfer available affiliate quota from the backend ledger.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Summary label="Referral count" value={String(referrals.length)} />
        <Summary label="Activated" value={String(activeReferrals)} />
        <Summary label="Total rewards" value={`${totalReward.toLocaleString()} Credit`} />
        <Summary label="Balance" value={`${balance.toLocaleString()} Credit`} />
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-on-surface">Your invite link</h2>
            <div className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-mono text-sm text-on-surface-variant">
              {referralLink || 'No invite code returned by backend yet.'}
            </div>
          </div>
          <button
            disabled={!referralLink}
            onClick={() => void copyText(referralLink)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ConsoleIcon name="copy" className="h-4 w-4" />
            Copy link
          </button>
        </div>
        {profile.inviteCode && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-on-surface-variant">Invite code</span>
            <code className="rounded border border-outline-variant bg-surface-container-low px-2 py-1">{profile.inviteCode}</code>
            <button onClick={() => void copyText(profile.inviteCode)} className="text-primary hover:underline">Copy</button>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface p-5">
        <h2 className="text-sm font-semibold text-on-surface">Bind inviter</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="Invite code"
            className="mn-input flex-1"
          />
          <button
            disabled={busy}
            onClick={() => void bindInviteCode()}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary disabled:opacity-50"
          >
            {busy ? 'Binding...' : 'Bind'}
          </button>
          <button onClick={() => void hydrateFromServer()} className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm text-on-surface-variant hover:text-primary">
            Refresh
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
        <div className="border-b border-outline-variant px-5 py-4">
          <h2 className="text-sm font-semibold text-primary">Referral records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <Th>User</Th>
                <Th>Registered UTC</Th>
                <Th>Status</Th>
                <Th>Reward</Th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-on-surface-variant">No referral records yet.</td>
                </tr>
              ) : referrals.map((referral) => (
                <tr key={referral.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <Td>{referral.email}</Td>
                  <Td>{referral.date}</Td>
                  <Td>{referral.status}</Td>
                  <Td>{referral.reward > 0 ? `${referral.reward.toLocaleString()} Credit` : '-'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface p-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{label}</span>
      <div className="mt-2 text-xl font-medium text-primary">{value}</div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{children}</th>
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-on-surface-variant">{children}</td>
}
