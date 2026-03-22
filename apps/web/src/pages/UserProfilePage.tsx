import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConsoleStore } from '../features/console/store'
import { showToast } from '../lib/toast'

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=ModelNex&background=111111&color=ffffff'
const DELETE_CONFIRM_TEXT = '我已知晓 ModelNex.AI 的用户相关协议及法律声明，我同意注销我的账户'

type Provider = 'email' | 'phone' | 'google' | 'github' | 'apple'

const providerDisplay: Record<Provider, string> = {
  email: 'Email-users-001',
  phone: 'Phone-users-001',
  google: 'Google-users-001',
  github: 'GitHub-users-001',
  apple: 'Apple-users-001',
}

export default function UserProfilePage() {
  const navigate = useNavigate()
  const { balance, profile, subscription, sessions, updateProfile, resetSubscriptionUsage } = useConsoleStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const provider = normalizeProvider(localStorage.getItem('mn-auth-provider'))
  const uid = useMemo(() => stableUid(), [])
  const registeredAt = useMemo(() => stableRegisteredAt(), [])
  const [avatar, setAvatar] = useState(() => localStorage.getItem('mn-avatar') || profile.avatarUrl || DEFAULT_AVATAR)
  const [twoFAEnabled, setTwoFAEnabled] = useState(() => localStorage.getItem('mn-2fa-enabled') === 'true')
  const [showResetTicket, setShowResetTicket] = useState(false)
  const [resetNote, setResetNote] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [connectedOverrides, setConnectedOverrides] = useState<Record<string, boolean>>({})
  const nickname = providerDisplay[provider]
  const email = localStorage.getItem('mn-user-email') || profile.email || `${provider}@dev.modelnex.ai`
  const phone = localStorage.getItem('mn-user-phone') || profile.phone || '+86 138 0000 0000'
  const concurrencyLimit = clamp(Number(profile.concurrencyLimit || 10), 1, 1000)
  const browser = browserName()
  const currentSession = {
    id: 'current-local-device',
    device: 'Windows PC',
    browser,
    ip: '192.168.x.x · Local network',
    lastActive: 'Online',
    current: true,
  }
  const visibleSessions = sessions.length > 0 ? sessions.map((session) => ({
    ...session,
    device: session.current ? 'Windows PC' : session.device,
    browser: session.current ? browser : session.browser,
    ip: session.current ? currentSession.ip : session.ip,
    lastActive: session.current ? 'Online' : session.lastActive,
  })) : [currentSession]
  const accounts = buildAccounts(provider, email, phone, connectedOverrides)
  const inviteCode = profile.inviteCode || 'MNX-DEMO'
  const hasSubscription = subscription.status === 'active'

  function handleAvatarChange(file?: File) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const nextAvatar = String(reader.result)
      localStorage.setItem('mn-avatar', nextAvatar)
      setAvatar(nextAvatar)
      window.dispatchEvent(new Event('mn-avatar-updated'))
      void updateProfile({ avatarUrl: nextAvatar })
      showToast('头像已更新')
    }
    reader.readAsDataURL(file)
  }

  function handle2FA() {
    if (twoFAEnabled) return
    localStorage.setItem('mn-2fa-enabled', 'true')
    setTwoFAEnabled(true)
    showToast('RFA 已设置')
  }

  function handleLogout() {
    for (const key of ['mn-logged-in', 'mn-username', 'mn-user-id', 'mn-session-token', 'mn-user-email', 'mn-user-phone', 'mn-auth-provider']) {
      localStorage.removeItem(key)
    }
    navigate('/')
  }

  function handleDeleteConfirm() {
    if (deleteInput !== DELETE_CONFIRM_TEXT) {
      showToast('请完整输入确认句后再继续', 'error')
      return
    }
    localStorage.setItem('mn-delete-requested-at', new Date().toISOString())
    showToast('注销申请已提交，账号已退出')
    handleLogout()
  }

  function submitResetTicket() {
    setResetNote('')
    setShowResetTicket(false)
    showToast('工单已发送')
  }

  function toggleConnected(providerName: string) {
    const key = providerName.toLowerCase()
    if (key === 'email' || key === 'phone') return
    setConnectedOverrides((prev) => ({ ...prev, [key]: true }))
    showToast(`${providerName} 已连接`)
  }

  return (
    <div className="min-h-screen bg-background px-5 py-12 text-on-surface md:px-10">
      <main className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-xl border border-outline-variant bg-surface p-6 text-center">
            <div className="relative mx-auto mb-5 h-28 w-28">
              <img className="h-28 w-28 rounded-full border-2 border-primary object-cover" src={avatar} alt="Profile avatar" />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleAvatarChange(event.target.files?.[0])} />
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm" title="更改头像">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            <h1 className="text-lg font-semibold text-primary">{nickname}</h1>
            <p className="mt-1 font-mono text-xs text-on-surface-variant">UID {uid}</p>
            <div className="mt-5 rounded-lg bg-surface-container-low p-3 text-left">
              <InfoLine label="注册时间" value={registeredAt} mono />
              <InfoLine label="并发限制" value={String(concurrencyLimit)} />
              <InfoLine label="余额" value={`${balance.toFixed(2)} Credit`} />
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-primary">账户预览</h2>
            <div className="flex items-center gap-3">
              <img className="h-12 w-12 rounded-full object-cover" src={avatar} alt="" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{nickname}</p>
                <p className="truncate text-xs text-on-surface-variant">{email}</p>
              </div>
            </div>
          </section>
        </aside>

        <div className="space-y-8">
          <Section title="已连接账户">
            <div className="divide-y divide-outline-variant/30 overflow-hidden rounded-xl border border-outline-variant bg-surface">
              {accounts.map((account) => (
                <div key={account.provider} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{account.provider}</p>
                    <p className="truncate text-sm text-on-surface-variant">{account.connected ? `已连接 · ${account.label}` : '未连接'}</p>
                  </div>
                  <button onClick={() => toggleConnected(account.provider)} className="text-xs font-semibold text-primary hover:underline">
                    {account.connected ? '更改' : '连接'}
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="安全与设备">
            <div className="mb-4 flex flex-wrap gap-3">
              <button onClick={() => setShowResetTicket(true)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low">重置密码</button>
              <button onClick={handle2FA} disabled={twoFAEnabled} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50">{twoFAEnabled ? 'RFA 已设置' : '设置 RFA'}</button>
            </div>
            <div className="divide-y divide-outline-variant/30 overflow-hidden rounded-xl border border-outline-variant bg-surface">
              {visibleSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-primary">desktop_windows</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{session.device} · {session.browser}</p>
                      <p className="truncate text-xs text-on-surface-variant">{session.ip} · {session.lastActive}</p>
                    </div>
                  </div>
                  {session.current && <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase text-primary">当前设备</span>}
                </div>
              ))}
            </div>
          </Section>

          <section className="grid gap-6 md:grid-cols-2">
            <Panel title="订阅状态">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Current Tier</p>
              <h3 className="mt-1 text-2xl font-semibold text-primary">{hasSubscription ? subscription.plan : '暂无订阅'}</h3>
              <Quota label="5h quota" used={subscription.used5h} total={subscription.quota5h} />
              <Quota label="Weekly quota" used={subscription.usedWeekly} total={subscription.quotaWeekly} />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => void resetSubscriptionUsage()} className="rounded-lg border border-outline-variant px-3 py-2 text-sm">重置用量</button>
                <button onClick={() => navigate('/pricing')} className="rounded-lg bg-primary px-3 py-2 text-sm text-on-primary">管理套餐</button>
              </div>
            </Panel>

            <Panel title="推荐">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Your Code</p>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4">
                <p className="min-w-0 flex-1 truncate font-mono text-xl text-primary">{inviteCode}</p>
                <button onClick={() => { void navigator.clipboard.writeText(inviteCode); showToast('邀请码已复制') }} className="material-symbols-outlined rounded-lg p-2 hover:bg-surface-container">content_copy</button>
              </div>
            </Panel>
          </section>

          <Section title="账户操作">
            <div className="divide-y divide-outline-variant/30 overflow-hidden rounded-xl border border-outline-variant bg-surface">
              <ActionRow title="退出账号" desc="清理当前浏览器登录状态，不影响账户数据。" action="退出账号" onClick={handleLogout} />
              <ActionRow title="注销账号" desc="发起 7 天冷静期注销流程，确认后当前账号会退出。" action="申请注销" danger onClick={() => setShowDeleteDialog(true)} />
            </div>
          </Section>
        </div>
      </main>

      {showResetTicket && (
        <Modal onClose={() => setShowResetTicket(false)}>
          <h3 className="text-lg font-semibold text-primary">申请重置密码</h3>
          <p className="mt-2 text-sm text-on-surface-variant">当前操作会向管理员发送工单。</p>
          <textarea value={resetNote} onChange={(event) => setResetNote(event.target.value)} className="mt-4 h-28 w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="备注，例如：需要重置登录密码。" />
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setShowResetTicket(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm">取消</button>
            <button onClick={submitResetTicket} className="rounded-lg bg-primary px-4 py-2 text-sm text-on-primary">发送工单</button>
          </div>
        </Modal>
      )}

      {showDeleteDialog && (
        <Modal onClose={() => setShowDeleteDialog(false)}>
          <h3 className="text-lg font-semibold text-error">注销账号确认</h3>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            当前操作会强制发起账号注销。账号进入 7 天冷静期，7 天内再次登录会取消或重启注销状态；7 天后未登录，账户信息会从用户可见数据库清除，后台保留审计日志。
          </p>
          <p className="mt-4 rounded-lg bg-surface-container-low p-3 text-xs text-on-surface-variant">请将这句话输入下方输入框：{DELETE_CONFIRM_TEXT}</p>
          <textarea value={deleteInput} onChange={(event) => setDeleteInput(event.target.value)} className="mt-3 h-24 w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm outline-none focus:ring-1 focus:ring-error" />
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setShowDeleteDialog(false)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm">否</button>
            <button onClick={handleDeleteConfirm} className="rounded-lg bg-error px-4 py-2 text-sm text-white">是</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function buildAccounts(provider: Provider, email: string, phone: string, overrides: Record<string, boolean>) {
  const rows = [
    { provider: 'Email', label: email, key: 'email', connected: provider === 'email' || Boolean(email) },
    { provider: 'Phone', label: phone, key: 'phone', connected: provider === 'phone' || Boolean(phone) },
    { provider: 'Google', label: 'Google-users-001', key: 'google', connected: provider === 'google' },
    { provider: 'GitHub', label: 'GitHub-users-001', key: 'github', connected: provider === 'github' },
    { provider: 'Apple', label: 'Apple-users-001', key: 'apple', connected: provider === 'apple' },
  ]
  return rows.map((row) => ({ ...row, connected: overrides[row.key] ?? row.connected }))
}

function stableUid() {
  const existing = localStorage.getItem('mn-user-uid16')
  if (existing && /^[A-Za-z0-9]{16}$/.test(existing)) return existing
  const source = `${localStorage.getItem('mn-user-id') || 'modelnex'}:${localStorage.getItem('mn-user-email') || ''}:${Date.now()}`
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz'
  let hash = 2166136261
  for (const char of source) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  let out = ''
  let n = hash >>> 0
  while (out.length < 16) {
    n = Math.imul(n ^ 0x9e3779b9, 2246822507) >>> 0
    out += alphabet[n % alphabet.length]
  }
  localStorage.setItem('mn-user-uid16', out)
  return out
}

function stableRegisteredAt() {
  const existing = localStorage.getItem('mn-registered-at')
  if (existing && !Number.isNaN(new Date(existing).getTime())) return new Date(existing).toISOString()
  const now = new Date().toISOString()
  localStorage.setItem('mn-registered-at', now)
  return now
}

function normalizeProvider(value: string | null): Provider {
  if (value === 'phone' || value === 'google' || value === 'github' || value === 'apple') return value
  return 'email'
}

function browserName() {
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'Microsoft Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  return 'Browser'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{title}</h2>
      {children}
    </section>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface p-5">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-on-surface-variant">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function InfoLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className={`text-right text-on-surface ${mono ? 'font-mono text-xs' : 'font-semibold'}`}>{value}</span>
    </div>
  )
}

function Quota({ label, used, total }: { label: string; used: number; total: number }) {
  const percent = total > 0 ? Math.min(100, used * 100 / total) : 0
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{used.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-variant">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function ActionRow({ title, desc, action, danger, onClick }: { title: string; desc: string; action: string; danger?: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className={`text-sm font-semibold ${danger ? 'text-error' : ''}`}>{title}</p>
        <p className="text-sm text-on-surface-variant">{desc}</p>
      </div>
      <button onClick={onClick} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${danger ? 'border-error text-error hover:bg-error-container/20' : 'border-outline-variant text-primary hover:bg-surface-container-low'}`}>{action}</button>
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
