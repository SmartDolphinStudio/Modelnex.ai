export interface ApiKey {
  id: string
  name: string
  key: string
  group: string
  status: 'active' | 'revoked' | 'limited'
  created: string
  lastUsed: string
  requests: number
  tokens: number
  cost: number
  limitAmount?: number
  limitPeriod?: string
  limitUsed?: number
  expiresAt?: string
}

export interface LogEntry {
  id: string
  time: string
  model: string
  latency: string
  duration: string
  status: 'success' | 'error'
  tokens: number
  uid: string
  cost: number
  keyName?: string
  intensity?: string
  endpoint?: string
  ip?: string
  group?: string
  requestType?: string
  billing?: string
  inputTokens?: number
  outputTokens?: number
  cacheTokens?: number
}

export interface Referral {
  id: string
  email: string
  date: string
  status: 'active' | 'pending'
  reward: number
}

export interface BillingEntry {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
}

export interface ProfileInfo {
  id: string
  email: string
  phone: string
  nickname: string
  avatarUrl: string
  inviteCode: string
  createdAt: string
  concurrencyUsed: number
  concurrencyLimit: number
}

export interface SubscriptionInfo {
  plan: string
  status: 'none' | 'active' | 'expired'
  billingCycle: string
  quota5h: number
  used5h: number
  quotaWeekly: number
  usedWeekly: number
  expiresAt: string
  nextResetAt: string
}

export interface ConnectedAccount {
  id: string
  provider: string
  label: string
  connected: boolean
}

export interface SessionDevice {
  id: string
  device: string
  browser: string
  ip: string
  lastActive: string
  current: boolean
}

export interface RedemptionEntry {
  id: string
  date: string
  code: string
  amount: number
  status: string
}

export interface ChartPoint {
  label: string
  requests?: number
  tokens?: number
  avg?: number
  p99?: number
  rate?: number
}

export interface ModelUsage {
  name: string
  requests: number
  tokens: number
  cached: number
  cacheRate: number
}

export interface AlertLog {
  time: string
  level: 'error' | 'warn'
  msg: string
}

export interface DashboardCharts {
  usageTrend: ChartPoint[]
  latencyTrend: ChartPoint[]
  errorRateTrend: ChartPoint[]
  modelUsage: ModelUsage[]
  alertLogs: AlertLog[]
}
