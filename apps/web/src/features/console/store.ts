import { create } from 'zustand'
import type {
  ApiKey,
  BillingEntry,
  DashboardCharts,
  LogEntry,
  ModelUsage,
  ProfileInfo,
  RedemptionEntry,
  Referral,
  SessionDevice,
  SubscriptionInfo,
  ConnectedAccount,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE || ''
const KEY_MASK = 'sk-****************'
const STATIC_SHOWCASE = true

type ConsoleServerState = Pick<ConsoleState,
  'balance' | 'plan' | 'planMonthlyCredit' | 'planUsed' | 'todayRequests' |
  'avgLatency' | 'avgErrorRate' | 'avgResponseTime' | 'totalTokens' |
  'successRate' | 'apiKeys' | 'logs' | 'referrals' | 'billing' |
  'profile' | 'subscription' | 'connectedAccounts' | 'sessions' |
  'redemptions' | 'charts'
>

interface ConsoleState {
  balance: number
  plan: string
  planMonthlyCredit: number
  planUsed: number
  todayRequests: number
  avgLatency: number
  avgErrorRate: number
  avgResponseTime: number
  totalTokens: number
  successRate: number
  apiKeys: ApiKey[]
  logs: LogEntry[]
  referrals: Referral[]
  billing: BillingEntry[]
  profile: ProfileInfo
  subscription: SubscriptionInfo
  connectedAccounts: ConnectedAccount[]
  sessions: SessionDevice[]
  redemptions: RedemptionEntry[]
  charts: DashboardCharts
  inviteCode: string
  activePage: string
  hydratedToken: string
  hydratedUserId: string
  hydrateFromServer: () => Promise<void>
  resetSessionState: () => void
  setActivePage: (page: string) => void
  applyServerState: (data: ConsoleServerState) => void
  addApiKey: (key: Omit<ApiKey, 'id' | 'key' | 'created' | 'lastUsed' | 'requests' | 'tokens' | 'cost'>) => Promise<string | null>
  updateApiKey: (id: string, key: Partial<ApiKey>) => Promise<boolean>
  deleteApiKey: (id: string) => Promise<boolean>
  toggleApiKeyStatus: (id: string) => Promise<boolean>
  redeemInviteCode: (code: string) => Promise<boolean>
  rechargeBalance: (amount: number, paymentMethod: string) => Promise<boolean>
  resetSubscriptionUsage: () => Promise<boolean>
  updateProfile: (patch: Partial<ProfileInfo>) => Promise<boolean>
  redeemVoucher: (code: string) => Promise<boolean>
}

const emptyCharts: DashboardCharts = {
  usageTrend: [],
  latencyTrend: [],
  errorRateTrend: [],
  modelUsage: [],
  alertLogs: [],
}

const defaultProfile: ProfileInfo = {
  id: '',
  email: '',
  phone: '',
  nickname: '',
  avatarUrl: '',
  inviteCode: '',
  createdAt: '',
  concurrencyUsed: 0,
  concurrencyLimit: 1,
}

const defaultSubscription: SubscriptionInfo = {
  plan: 'Free',
  status: 'none',
  billingCycle: '',
  quota5h: 0,
  used5h: 0,
  quotaWeekly: 0,
  usedWeekly: 0,
  expiresAt: '',
  nextResetAt: '',
}

function showcaseServerState(): ConsoleServerState {
  const logs: LogEntry[] = [
    { id: 'req-2184', time: '2026-08-31 20:24:17', model: 'GPT-5', latency: '248 ms', duration: '1.12 s', status: 'success', tokens: 12840, uid: 'usr_7c4a', cost: 0.184, keyName: 'Production chat', intensity: 'Standard', endpoint: '/v1/chat/completions', ip: '192.168.44.1', group: 'General', requestType: 'Chat', billing: 'Pay-as-you-go', inputTokens: 4380, outputTokens: 6960, cacheTokens: 1500 },
    { id: 'req-2183', time: '2026-08-31 20:21:49', model: 'Claude Sonnet', latency: '312 ms', duration: '1.46 s', status: 'success', tokens: 8940, uid: 'usr_7c4a', cost: 0.142, keyName: 'Production chat', intensity: 'Priority', endpoint: '/v1/messages', ip: '192.168.44.1', group: 'General', requestType: 'Chat', billing: 'Pay-as-you-go', inputTokens: 3250, outputTokens: 4610, cacheTokens: 1080 },
    { id: 'req-2182', time: '2026-08-31 20:18:03', model: 'Gemini Pro', latency: '191 ms', duration: '0.94 s', status: 'success', tokens: 6420, uid: 'usr_7c4a', cost: 0.076, keyName: 'Analytics worker', intensity: 'Standard', endpoint: '/v1/chat/completions', ip: '192.168.44.24', group: 'Analytics', requestType: 'Chat', billing: 'Monthly credit', inputTokens: 2860, outputTokens: 2910, cacheTokens: 650 },
    { id: 'req-2181', time: '2026-08-31 20:15:26', model: 'DeepSeek V3', latency: '276 ms', duration: '1.31 s', status: 'success', tokens: 5340, uid: 'usr_7c4a', cost: 0.041, keyName: 'Analytics worker', intensity: 'Batch', endpoint: '/v1/responses', ip: '192.168.44.24', group: 'Analytics', requestType: 'Reasoning', billing: 'Monthly credit', inputTokens: 2430, outputTokens: 2340, cacheTokens: 570 },
    { id: 'req-2180', time: '2026-08-31 20:11:08', model: 'GPT-5', latency: '429 ms', duration: '1.94 s', status: 'error', tokens: 1180, uid: 'usr_7c4a', cost: 0.012, keyName: 'Sandbox', intensity: 'Standard', endpoint: '/v1/chat/completions', ip: '192.168.44.56', group: 'Sandbox', requestType: 'Chat', billing: 'Pay-as-you-go', inputTokens: 1020, outputTokens: 0, cacheTokens: 160 },
  ]

  return {
    balance: 482.35,
    plan: 'Studio',
    planMonthlyCredit: 1200,
    planUsed: 418.6,
    todayRequests: 3869,
    avgLatency: 268,
    avgErrorRate: 0.7,
    avgResponseTime: 1.18,
    totalTokens: 18425421,
    successRate: 99.3,
    apiKeys: [
      { id: 'demo-key-01', name: 'Production chat', key: 'mn-demo-key-01', group: 'general', status: 'active', created: '2026-08-01T09:30:00Z', lastUsed: '2026-08-31T20:24:17Z', requests: 1832, tokens: 8462430, cost: 128.64, limitAmount: 200000, limitPeriod: '1 天', limitUsed: 86120, expiresAt: '2026-10-31' },
      { id: 'demo-key-02', name: 'Analytics worker', key: 'mn-demo-key-02', group: 'analytics', status: 'active', created: '2026-08-14T03:20:00Z', lastUsed: '2026-08-31T20:18:03Z', requests: 1267, tokens: 6210860, cost: 94.18, limitAmount: 120000, limitPeriod: '1 天', limitUsed: 53860, expiresAt: '2026-11-15' },
      { id: 'demo-key-03', name: 'Sandbox', key: 'mn-demo-key-03', group: 'sandbox', status: 'limited', created: '2026-08-26T12:10:00Z', lastUsed: '2026-08-31T20:11:08Z', requests: 770, tokens: 3752131, cost: 42.76, limitAmount: 25000, limitPeriod: '5 小时', limitUsed: 19440, expiresAt: '2026-09-15' },
    ],
    logs,
    referrals: [
      { id: 'ref-01', email: 'studio@smartdolphin.dev', date: '2026-08-22', status: 'active', reward: 36 },
      { id: 'ref-02', email: 'research@smartdolphin.dev', date: '2026-08-28', status: 'pending', reward: 12 },
    ],
    billing: [
      { id: 'order-01', date: '2026-08-28', description: 'Credit top-up', amount: 500, type: 'credit' },
      { id: 'order-02', date: '2026-08-14', description: 'Studio monthly credit', amount: 1200, type: 'credit' },
      { id: 'order-03', date: '2026-08-04', description: 'Model usage settlement', amount: -128.64, type: 'debit' },
    ],
    profile: { id: 'usr_demo_7c4a', email: 'demo@smartdolphin.dev', phone: '', nickname: 'Smart Dolphin', avatarUrl: '/smartdolphin.png', inviteCode: 'DOLPHIN26', createdAt: '2026-08-01', concurrencyUsed: 3, concurrencyLimit: 12 },
    subscription: { plan: 'Studio', status: 'active', billingCycle: 'Renews monthly', quota5h: 450, used5h: 168, quotaWeekly: 1200, usedWeekly: 418.6, expiresAt: '2026-09-30', nextResetAt: '2026-09-01' },
    connectedAccounts: [{ id: 'smart-dolphin', provider: 'Smart Dolphin', label: 'Smart Dolphin', connected: true }],
    sessions: [{ id: 'session-current', device: 'Windows PC', browser: browserName(), ip: '192.168.44.1', lastActive: '刚刚', current: true }],
    redemptions: [{ id: 'redeem-01', date: '2026-08-28', code: 'WELCOME10', amount: 50, status: '已到账' }],
    charts: {
      usageTrend: [
        { label: '08/25', requests: 3120, tokens: 1780420 }, { label: '08/26', requests: 3280, tokens: 1931520 },
        { label: '08/27', requests: 2940, tokens: 1650340 }, { label: '08/28', requests: 3440, tokens: 2078140 },
        { label: '08/29', requests: 3610, tokens: 2210660 }, { label: '08/30', requests: 3520, tokens: 2154341 },
        { label: '08/31', requests: 3869, tokens: 2380000 },
      ],
      latencyTrend: [
        { label: '08/25', avg: 286, p99: 498 }, { label: '08/26', avg: 271, p99: 462 }, { label: '08/27', avg: 294, p99: 521 },
        { label: '08/28', avg: 265, p99: 441 }, { label: '08/29', avg: 252, p99: 413 }, { label: '08/30', avg: 259, p99: 438 }, { label: '08/31', avg: 268, p99: 452 },
      ],
      errorRateTrend: [
        { label: '08/25', rate: 1.1 }, { label: '08/26', rate: 0.8 }, { label: '08/27', rate: 1.3 }, { label: '08/28', rate: 0.6 }, { label: '08/29', rate: 0.5 }, { label: '08/30', rate: 0.8 }, { label: '08/31', rate: 0.7 },
      ],
      modelUsage: [
        { name: 'GPT-5', requests: 1480, tokens: 7124840, cached: 1287940, cacheRate: 18.1 },
        { name: 'Claude Sonnet', requests: 1014, tokens: 4962271, cached: 838560, cacheRate: 16.9 },
        { name: 'Gemini Pro', requests: 812, tokens: 3716580, cached: 706150, cacheRate: 19.0 },
        { name: 'DeepSeek V3', requests: 563, tokens: 2621730, cached: 419480, cacheRate: 16.0 },
      ],
      alertLogs: [
        { time: '20:11', level: 'warn', msg: 'Sandbox key reached 78% of its 5-hour limit.' },
        { time: '18:42', level: 'warn', msg: 'One upstream retry was recovered automatically.' },
      ],
    },
  }
}

function pickServerState(data: ConsoleServerState) {
  return {
    balance: data.balance,
    plan: data.plan,
    planMonthlyCredit: data.planMonthlyCredit,
    planUsed: data.planUsed,
    todayRequests: data.todayRequests,
    avgLatency: data.avgLatency,
    avgErrorRate: data.avgErrorRate,
    avgResponseTime: data.avgResponseTime,
    totalTokens: data.totalTokens,
    successRate: data.successRate,
    apiKeys: data.apiKeys,
    logs: data.logs,
    referrals: data.referrals,
    billing: data.billing,
    profile: data.profile,
    subscription: data.subscription,
    connectedAccounts: data.connectedAccounts,
    sessions: data.sessions,
    redemptions: data.redemptions,
    charts: data.charts,
  }
}

function emptyServerState(): ConsoleServerState {
  return showcaseServerState()
}

async function apiRequest(path: string, options?: RequestInit) {
  const token = localStorage.getItem('mn-session-token') || ''
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  })

  const text = await res.text()
  let data: any = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `API request failed: ${res.status}`)
  }
  if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
    if (Number(data.code) !== 0) throw new Error(data.message || `API request failed: ${data.code}`)
    return data.data
  }
  return data
}

async function optionalApi(path: string, options?: RequestInit) {
  try {
    return await apiRequest(path, options)
  } catch {
    return null
  }
}

function envelopeData(data: any) {
  return data && typeof data === 'object' && 'code' in data && 'data' in data ? data.data : data
}

function envelopeItems(data: any) {
  const payload = envelopeData(data)
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.list)) return payload.list
  if (Array.isArray(payload?.models)) return payload.models
  if (Array.isArray(payload?.trend)) return payload.trend
  if (Array.isArray(payload?.invitees)) return payload.invitees
  return []
}

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toISOString()
}

function browserName() {
  const ua = navigator.userAgent
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  return 'Browser'
}

function boundedConcurrency(value: any) {
  const numeric = Number(value || 1)
  if (!Number.isFinite(numeric)) return 1
  return Math.min(1000, Math.max(1, Math.round(numeric)))
}

function mapApiKey(item: any): ApiKey {
  const quota = item.quota ?? item.limit_amount ?? item.rate_limit_5h ?? item.rate_limit_1d ?? item.rate_limit_7d
  const limitAmount = quota !== undefined && quota !== null && Number(quota) > 0 ? Number(quota) : undefined
  const rawStatus = String(item.status || '').toLowerCase()
  const status: ApiKey['status'] = rawStatus === 'active' || item.status === 1 || item.enabled
    ? 'active'
    : rawStatus === 'limited'
      ? 'limited'
      : 'revoked'

  return {
    id: String(item.id || ''),
    name: item.name || 'API Key',
    key: item.key || item.masked_key || KEY_MASK,
    group: item.group?.name || item.group_name || (item.group_id ? String(item.group_id) : 'All models'),
    status,
    created: formatDate(item.created_at),
    lastUsed: formatDate(item.last_used_at),
    requests: Number(item.requests || item.request_count || 0),
    tokens: Number(item.tokens || item.total_tokens || 0),
    cost: Number(item.actual_cost || item.total_cost || item.quota_used || 0),
    limitAmount,
    limitPeriod: limitAmount ? 'Total quota' : undefined,
    limitUsed: Number(item.quota_used || item.limit_used || 0),
    expiresAt: item.expires_at ? String(item.expires_at).slice(0, 10) : undefined,
  }
}

function sameUserID(left: any, right: any) {
  const a = String(left ?? '').replace(/^0+/, '')
  const b = String(right ?? '').replace(/^0+/, '')
  return a !== '' && b !== '' && a === b
}

function userScopedItems(data: any, userID: any) {
  const items = envelopeItems(data)
  const uid = String(userID ?? '').replace(/^0+/, '')
  if (!uid) return items
  return items.filter((item: any) => {
    if (item == null || typeof item !== 'object') return false
    if (item.user_id == null && item.userId == null && item.user?.id == null) return true
    return sameUserID(item.user_id ?? item.userId ?? item.user?.id, uid)
  })
}

function mapUsageLog(item: any): LogEntry {
  const tokens = Number(item.input_tokens || 0) + Number(item.output_tokens || 0) + Number(item.cache_creation_tokens || 0) + Number(item.cache_read_tokens || 0)
  return {
    id: String(item.id || item.request_id || ''),
    time: formatDate(item.created_at),
    model: item.model || '-',
    latency: item.first_token_ms ? `${item.first_token_ms}ms` : '-',
    duration: item.duration_ms ? `${item.duration_ms}ms` : '-',
    status: Number(item.status_code || 200) >= 400 || item.error ? 'error' : 'success',
    tokens,
    uid: String(item.user_id || ''),
    cost: Number(item.actual_cost || item.total_cost || 0),
  }
}

function mapRedemption(item: any): RedemptionEntry {
  return {
    id: String(item.id || item.code || Date.now()),
    date: formatDate(item.used_at || item.created_at),
    code: item.code || '-',
    amount: Number(item.value || item.amount || 0),
    status: item.status || 'redeemed',
  }
}

function mapBilling(item: any): BillingEntry {
  const amount = Number(item.amount || item.pay_amount || 0)
  return {
    id: String(item.id || item.out_trade_no || Date.now()),
    date: formatDate(item.created_at),
    description: item.order_type || item.payment_type || item.description || 'Payment order',
    amount,
    type: item.status === 'paid' || item.status === 'completed' || amount > 0 ? 'credit' : 'debit',
  }
}

function readLocalCreditBalance() {
  const value = Number(localStorage.getItem('mn-local-credit-balance') || 0)
  return Number.isFinite(value) ? value : 0
}

function readLocalPaymentOrders(): BillingEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem('mn-local-payment-orders') || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.map((item: any) => ({
      id: String(item.id || item.orderId || Date.now()),
      date: formatDate(item.date || item.created_at),
      description: item.description || 'API credit recharge',
      amount: Number(item.amount || 0),
      type: 'credit' as const,
    }))
  } catch {
    return []
  }
}

function mapReferral(item: any): Referral {
  return {
    id: String(item.user_id || item.id || item.email || item.username || Date.now()),
    email: item.email || item.username || `user-${item.user_id || 'unknown'}`,
    date: formatDate(item.created_at),
    status: Number(item.total_rebate || 0) > 0 ? 'active' : 'pending',
    reward: Number(item.total_rebate || 0),
  }
}

function connectedAccountsFromProfile(user: any): ConnectedAccount[] {
  const bindings = user.auth_bindings || user.identity_bindings || user.identities || {}
  return [
    { id: 'email', provider: 'Email', label: user.email || bindings.email?.display_name || 'Email', connected: Boolean(user.email_bound || user.email || bindings.email?.bound) },
    { id: 'google', provider: 'Google', label: bindings.google?.display_name || 'Google', connected: Boolean(user.google_bound || bindings.google?.bound) },
    { id: 'github', provider: 'GitHub', label: bindings.github?.display_name || 'GitHub', connected: Boolean(user.github_bound || bindings.github?.bound) },
    { id: 'apple', provider: 'Apple', label: bindings.apple?.display_name || 'Apple', connected: Boolean(user.apple_bound || bindings.apple?.bound) },
    { id: 'phone', provider: 'Phone', label: user.phone || 'Phone', connected: Boolean(user.phone) },
  ]
}

function currentSession(): SessionDevice {
  return {
    id: 'current',
    device: navigator.platform?.includes('Win') ? 'Windows PC' : 'Current Device',
    browser: browserName(),
    ip: 'Local network',
    lastActive: 'Online',
    current: true,
  }
}

function buildStateFromNative(
  profile: any,
  keysData: any,
  usageData: any,
  stats: any,
  modelsData: any,
  ordersData?: any,
  redemptionsData?: any,
  affiliateData?: any,
  subscriptionData?: any,
  trendData?: any,
): ConsoleServerState {
  const user = envelopeData(profile) || {}
  const affiliate = envelopeData(affiliateData) || {}
  const subscription = envelopeData(subscriptionData) || {}
  const logs = userScopedItems(usageData, user.id).map(mapUsageLog)
  const dashboardStats = envelopeData(stats) || {}
  const totalTokens = Number(dashboardStats.total_tokens || dashboardStats.totalTokens || logs.reduce((sum: number, item: LogEntry) => sum + item.tokens, 0))
  const todayRequests = Number(dashboardStats.today_requests || dashboardStats.todayRequests || logs.length)

  const modelUsage: ModelUsage[] = envelopeItems(modelsData).map((item: any) => ({
    name: item.model || item.name || '-',
    requests: Number(item.requests || 0),
    tokens: Number(item.total_tokens || item.tokens || 0),
    cached: Number(item.cache_read_tokens || item.cached || 0),
    cacheRate: Number(item.cache_hit_rate || item.cacheRate || 0),
  }))
  const usageTrend = envelopeItems(trendData).map((item: any) => ({
    label: item.date || item.label || item.time || '',
    requests: Number(item.requests || 0),
    tokens: Number(item.total_tokens || item.tokens || 0),
  })).filter((item: any) => item.label)

  return {
    balance: Number(user.balance || 0),
    plan: subscription?.group?.name || subscription?.plan || (user.role === 'admin' ? 'Admin' : 'Free'),
    planMonthlyCredit: Number(subscription?.quota_weekly || subscription?.weekly_limit_usd || 0),
    planUsed: Number(subscription?.used_weekly || subscription?.weekly_usage_usd || 0),
    todayRequests,
    avgLatency: Number(dashboardStats.avg_latency || dashboardStats.avgLatency || 0),
    avgErrorRate: Number(dashboardStats.error_rate || dashboardStats.errorRate || 0),
    avgResponseTime: Number(dashboardStats.avg_response_time || dashboardStats.avgResponseTime || 0),
    totalTokens,
    successRate: logs.length ? Math.round((logs.filter((item: LogEntry) => item.status === 'success').length / logs.length) * 100) : Number(dashboardStats.success_rate || 0),
    apiKeys: userScopedItems(keysData, user.id).map(mapApiKey),
    logs,
    referrals: envelopeItems(affiliate).map(mapReferral),
    billing: envelopeItems(ordersData).map(mapBilling),
    profile: {
      id: user.id ? String(user.id).padStart(16, '0') : '',
      email: user.email || '',
      phone: user.phone || '',
      nickname: user.username || user.display_name || user.email || '',
      avatarUrl: user.avatar_url || localStorage.getItem('mn-avatar') || '',
      inviteCode: affiliate.aff_code || user.invitation_code || '',
      createdAt: formatDate(user.created_at),
      concurrencyUsed: Number(user.concurrency_used || 0),
      concurrencyLimit: boundedConcurrency(user.concurrency || user.concurrency_limit),
    },
    subscription: {
      plan: subscription?.group?.name || subscription?.plan || defaultSubscription.plan,
      status: subscription?.status === 'active' ? 'active' : subscription?.status === 'expired' ? 'expired' : 'none',
      billingCycle: subscription?.billing_cycle || '',
      quota5h: Number(subscription?.quota_5h || subscription?.daily_limit_usd || 0),
      used5h: Number(subscription?.used_5h || subscription?.daily_usage_usd || 0),
      quotaWeekly: Number(subscription?.quota_weekly || subscription?.weekly_limit_usd || 0),
      usedWeekly: Number(subscription?.used_weekly || subscription?.weekly_usage_usd || 0),
      expiresAt: formatDate(subscription?.expires_at),
      nextResetAt: formatDate(subscription?.next_reset_at || subscription?.weekly_window_start),
    },
    connectedAccounts: connectedAccountsFromProfile(user),
    sessions: [currentSession()],
    redemptions: envelopeItems(redemptionsData).map(mapRedemption),
    charts: {
      usageTrend,
      latencyTrend: [],
      errorRateTrend: [],
      modelUsage,
      alertLogs: [],
    },
  }
}

function groupIDFromValue(value?: string) {
  if (!value || value === 'All models' || value === '全部模型') return null
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

function ratePayload(period?: string, amount?: number) {
  if (!amount || !period || period === 'No limit' || period === '不限') return {}
  if (period === '5 hours' || period === '5h' || period === '5 小时') return { rate_limit_5h: amount }
  if (period === '1 day' || period === '1d' || period === '1 天') return { rate_limit_1d: amount }
  if (period === '7 days' || period === '7d' || period === '7 天') return { rate_limit_7d: amount }
  return { quota: amount }
}

function expiresInDays(dateValue?: string) {
  if (!dateValue) return undefined
  const end = new Date(`${dateValue}T23:59:59`)
  if (Number.isNaN(end.getTime())) return undefined
  return Math.max(1, Math.ceil((end.getTime() - Date.now()) / 86400000))
}

export const useConsoleStore = create<ConsoleState>((set, get) => ({
  ...pickServerState(showcaseServerState()),
  inviteCode: '',
  activePage: 'dashboard',
  hydratedToken: '',
  hydratedUserId: '',
  applyServerState: (data) => set(pickServerState(data)),
  resetSessionState: () => set({
    ...pickServerState(emptyServerState()),
    hydratedToken: '',
    hydratedUserId: '',
  }),
  hydrateFromServer: async () => {
    const token = localStorage.getItem('mn-session-token') || ''
    if (STATIC_SHOWCASE) {
      const state = showcaseServerState()
      set({ ...pickServerState(state), hydratedToken: token, hydratedUserId: state.profile.id })
      return
    }
    if (!token) {
      get().resetSessionState()
      return
    }
    if (get().hydratedToken && get().hydratedToken !== token) {
      get().resetSessionState()
    }
    const [profile, keysData, usageData, stats, modelsData, ordersData, redemptionsData, affiliateData, subscriptionData, trendData] = await Promise.all([
      optionalApi('/api/v1/user/profile'),
      optionalApi('/api/v1/keys?page=1&page_size=100'),
      optionalApi('/api/v1/usage?page=1&page_size=50'),
      optionalApi('/api/v1/usage/dashboard/stats'),
      optionalApi('/api/v1/usage/dashboard/models'),
      optionalApi('/api/v1/payment/orders/my?page=1&page_size=50'),
      optionalApi('/api/v1/redeem/history'),
      optionalApi('/api/v1/user/aff'),
      optionalApi('/api/v1/subscriptions/active'),
      optionalApi('/api/v1/usage/dashboard/trend?granularity=day'),
    ])
    if (profile) {
      const state = buildStateFromNative(profile, keysData, usageData, stats, modelsData, ordersData, redemptionsData, affiliateData, subscriptionData, trendData)
      set({
        ...pickServerState(state),
        hydratedToken: token,
        hydratedUserId: state.profile.id,
      })
    } else {
      get().resetSessionState()
    }
  },
  setActivePage: (page) => set({ activePage: page }),
  addApiKey: async (keyData) => {
    if (STATIC_SHOWCASE) {
      const id = `demo-key-${Date.now()}`
      const key = `mn-demo-${Math.random().toString(36).slice(2, 10)}`
      set((state) => ({
        apiKeys: [{
          id,
          name: keyData.name,
          key,
          group: keyData.group,
          status: 'active',
          created: new Date().toISOString(),
          lastUsed: '-',
          requests: 0,
          tokens: 0,
          cost: 0,
          limitAmount: keyData.limitAmount,
          limitPeriod: keyData.limitPeriod,
          limitUsed: 0,
          expiresAt: keyData.expiresAt,
        }, ...state.apiKeys],
      }))
      return key
    }
    try {
      const limitAmount = keyData.limitAmount ? Number(keyData.limitAmount) : undefined
      const created = await apiRequest('/api/v1/keys', {
        method: 'POST',
        body: JSON.stringify({
          name: keyData.name,
          group_id: groupIDFromValue(keyData.group),
          quota: limitAmount && (!keyData.limitPeriod || keyData.limitPeriod === 'Total quota' || keyData.limitPeriod === '总额度') ? limitAmount : undefined,
          expires_in_days: expiresInDays(keyData.expiresAt),
          ...ratePayload(keyData.limitPeriod, limitAmount),
        }),
      })
      await get().hydrateFromServer()
      return created?.key || created?.api_key?.key || null
    } catch {
      return null
    }
  },
  updateApiKey: async (id, keyData) => {
    if (STATIC_SHOWCASE) {
      set((state) => ({ apiKeys: state.apiKeys.map((item) => item.id === id ? { ...item, ...keyData } : item) }))
      return true
    }
    try {
      const limitAmount = keyData.limitAmount ? Number(keyData.limitAmount) : undefined
      await apiRequest(`/api/v1/keys/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: keyData.name,
          group_id: groupIDFromValue(keyData.group),
          quota: limitAmount,
          expires_at: keyData.expiresAt ? `${keyData.expiresAt}T23:59:59Z` : undefined,
          ...ratePayload(keyData.limitPeriod, limitAmount),
        }),
      })
      await get().hydrateFromServer()
      return true
    } catch {
      return false
    }
  },
  deleteApiKey: async (id) => {
    if (STATIC_SHOWCASE) {
      set((state) => ({ apiKeys: state.apiKeys.filter((item) => item.id !== id) }))
      return true
    }
    try {
      await apiRequest(`/api/v1/keys/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await get().hydrateFromServer()
      return true
    } catch {
      return false
    }
  },
  toggleApiKeyStatus: async (id) => {
    if (STATIC_SHOWCASE) {
      set((state) => ({ apiKeys: state.apiKeys.map((item) => item.id === id ? { ...item, status: item.status === 'active' ? 'revoked' : 'active' } : item) }))
      return true
    }
    try {
      const key = get().apiKeys.find((item) => item.id === id)
      await apiRequest(`/api/v1/keys/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ status: key?.status === 'active' ? 'inactive' : 'active' }),
      })
      await get().hydrateFromServer()
      return true
    } catch {
      return false
    }
  },
  redeemInviteCode: async (code) => {
    if (STATIC_SHOWCASE) {
      const normalizedCode = code.trim().toUpperCase()
      if (!normalizedCode) return false
      set((state) => ({ inviteCode: normalizedCode }))
      return true
    }
    try {
      await apiRequest('/api/v1/user/aff/bind', { method: 'POST', body: JSON.stringify({ code: code.trim() }) })
      await get().hydrateFromServer()
      return true
    } catch {
      return false
    }
  },
  rechargeBalance: async (amount, paymentMethod) => {
    if (STATIC_SHOWCASE) {
      window.location.href = `/api-credit?amount=${encodeURIComponent(String(amount))}&method=${encodeURIComponent(paymentMethod)}`
      return true
    }
    try {
      await apiRequest('/api/v1/payment/orders', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          payment_type: paymentMethod,
          payment_source: 'modelnex-console',
          order_type: 'balance',
          return_url: `${window.location.origin}/console/recharge`,
          is_mobile: /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent),
        }),
      })
      await get().hydrateFromServer()
      return true
    } catch {
      window.location.href = `/api-credit?amount=${encodeURIComponent(String(amount))}&method=${encodeURIComponent(paymentMethod)}`
      return false
    }
  },
  resetSubscriptionUsage: async () => {
    await get().hydrateFromServer()
    return true
  },
  updateProfile: async (patch) => {
    if (STATIC_SHOWCASE) {
      if (patch.avatarUrl) localStorage.setItem('mn-avatar', patch.avatarUrl)
      set((state) => ({
        profile: { ...state.profile, ...patch },
        connectedAccounts: state.connectedAccounts,
      }))
      return true
    }
    try {
      const payload: Record<string, unknown> = {}
      if (patch.nickname !== undefined) payload.username = patch.nickname
      if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl
      const profile = await apiRequest('/api/v1/user', { method: 'PUT', body: JSON.stringify(payload) })
      const user = envelopeData(profile) || {}
      if (patch.avatarUrl) localStorage.setItem('mn-avatar', patch.avatarUrl)
      set((state) => ({
        profile: {
          ...state.profile,
          email: user.email || state.profile.email,
          nickname: user.username || user.display_name || state.profile.nickname,
          avatarUrl: user.avatar_url || patch.avatarUrl || state.profile.avatarUrl,
        },
        connectedAccounts: connectedAccountsFromProfile({ ...user, email: user.email || state.profile.email }),
      }))
      return true
    } catch {
      return false
    }
  },
  redeemVoucher: async (code) => {
    if (STATIC_SHOWCASE) {
      if (!code.trim()) return false
      set((state) => ({
        redemptions: [{ id: `redeem-${Date.now()}`, date: new Date().toISOString(), code: code.trim().toUpperCase(), amount: 10, status: 'redeemed' }, ...state.redemptions],
        balance: state.balance + 10,
      }))
      return true
    }
    try {
      await apiRequest('/api/v1/redeem', { method: 'POST', body: JSON.stringify({ code }) })
      await get().hydrateFromServer()
      return true
    } catch {
      return false
    }
  },
}))
