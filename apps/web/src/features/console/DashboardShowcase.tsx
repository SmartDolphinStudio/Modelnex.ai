import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useConsoleStore } from './store'
import ConsoleIcon from './ConsoleIcon'

const chartGrid = '#e5ded7'
const tooltipStyle = { borderRadius: 8, border: '1px solid #d5c2bd', fontSize: 12 }

function compact(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toLocaleString()
}

export default function DashboardShowcase() {
  const { balance, todayRequests, avgResponseTime, avgLatency, successRate, totalTokens, charts, logs } = useConsoleStore()
  const inputTokens = logs.reduce((sum, item) => sum + Number(item.inputTokens || 0), 0)
  const outputTokens = logs.reduce((sum, item) => sum + Number(item.outputTokens || 0), 0)
  const cacheTokens = logs.reduce((sum, item) => sum + Number(item.cacheTokens || 0), 0)
  const modelData = charts.modelUsage.map((item) => ({ name: item.name.replace(' ', '\n'), requests: item.requests }))
  const performance = [
    { label: '平均延迟', value: `${avgLatency} ms`, detail: 'P99 452 ms', icon: 'speed' },
    { label: '平均正确率', value: `${successRate}%`, detail: '7 日稳定', icon: 'verified' },
    { label: '输入 Token', value: compact(inputTokens), detail: '本次明细', icon: 'input' },
    { label: '输出 Token', value: compact(outputTokens), detail: '本次明细', icon: 'output' },
    { label: '缓存 Token', value: compact(cacheTokens), detail: '命中率 17.8%', icon: 'database' },
  ]

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 border-b border-outline-variant/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Console overview</p>
          <h1 className="mt-1 text-2xl font-semibold text-primary">仪表盘</h1>
          <p className="mt-1 text-sm text-on-surface-variant">核心指标、模型表现与最近调用明细。</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />实时展示
        </span>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="余额" value={balance.toFixed(2)} unit="Credit" detail="可用额度" icon="account_balance_wallet" />
        <MetricCard label="总请求" value={todayRequests.toLocaleString()} unit="Requests" detail="最近 24 小时" icon="query_stats" />
        <MetricCard label="平均响应" value={avgResponseTime.toFixed(2)} unit="seconds" detail="端到端耗时" icon="timer" />
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-outline-variant bg-outline-variant sm:grid-cols-3 xl:grid-cols-5">
        {performance.map((item) => (
          <div key={item.label} className="min-h-32 bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-on-surface-variant">{item.label}</span>
              <ConsoleIcon name={item.icon} className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-5 text-xl font-semibold text-on-surface">{item.value}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="请求趋势" icon="show_chart">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={charts.usageTrend}>
              <defs><linearGradient id="dashboardRequests" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7f5445" stopOpacity={0.24} /><stop offset="95%" stopColor="#7f5445" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke={chartGrid} strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="requests" name="请求" stroke="#7f5445" strokeWidth={2.2} fill="url(#dashboardRequests)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Token 使用趋势" icon="monitoring">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={charts.usageTrend}>
              <CartesianGrid vertical={false} stroke={chartGrid} strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value || 0).toLocaleString(), 'Token']} />
              <Line type="monotone" dataKey="tokens" name="Token" stroke="#0f766e" strokeWidth={2.2} dot={{ r: 2, fill: '#0f766e' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="延迟分布" icon="speed">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={charts.latencyTrend}>
              <CartesianGrid vertical={false} stroke={chartGrid} strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis unit=" ms" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="avg" name="平均" stroke="#7f5445" strokeWidth={2.2} dot={false} />
              <Line type="monotone" dataKey="p99" name="P99" stroke="#d97706" strokeWidth={1.7} strokeDasharray="5 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="模型请求分布" icon="account_tree">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={modelData}>
              <CartesianGrid vertical={false} stroke={chartGrid} strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="requests" name="请求" fill="#7f5445" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <div><h2 className="text-sm font-semibold text-on-surface">最近调用日志</h2><p className="mt-1 text-xs text-on-surface-variant">展示最近模型调用的关键性能指标。</p></div>
          <ConsoleIcon name="receipt_long" className="h-5 w-5 text-primary" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-surface-container-low"><tr>{['时间', '密钥', '模型', '端点', 'Token', '延迟', '状态'].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold text-on-surface-variant">{heading}</th>)}</tr></thead>
            <tbody>
              {logs.map((entry) => <tr key={entry.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low"><td className="px-5 py-3 text-xs font-mono text-on-surface-variant">{entry.time}</td><td className="px-5 py-3 text-sm font-medium text-on-surface">{entry.keyName}</td><td className="px-5 py-3 text-sm text-on-surface">{entry.model}</td><td className="px-5 py-3 text-xs font-mono text-on-surface-variant">{entry.endpoint}</td><td className="px-5 py-3 text-sm text-on-surface">{entry.tokens.toLocaleString()}</td><td className="px-5 py-3 text-sm text-on-surface">{entry.latency}</td><td className="px-5 py-3"><Status status={entry.status} /></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <QuickAction icon="key" title="API 密钥" detail="创建与管理访问密钥" />
        <QuickAction icon="assessment" title="使用统计" detail="查看模型与 Token 明细" />
        <QuickAction icon="account_balance_wallet" title="充值中心" detail="管理 Credit 额度" />
      </section>
    </div>
  )
}

function MetricCard({ label, value, unit, detail, icon }: { label: string; value: string; unit: string; detail: string; icon: string }) {
  return <div className="rounded-lg border border-outline-variant bg-surface p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-on-surface-variant">{label}</span><ConsoleIcon name={icon} className="h-5 w-5 text-primary" /></div><div className="mt-8 flex items-baseline gap-2"><span className="text-3xl font-semibold text-primary">{value}</span><span className="text-xs text-on-surface-variant">{unit}</span></div><p className="mt-2 text-xs text-on-surface-variant">{detail}</p></div>
}

function ChartPanel({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-outline-variant bg-surface p-5"><div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-semibold text-on-surface">{title}</h2><ConsoleIcon name={icon} className="h-5 w-5 text-primary" /></div>{children}</div>
}

function Status({ status }: { status: 'success' | 'error' }) {
  const success = status === 'success'
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${success ? 'bg-green-600' : 'bg-red-600'}`} />{success ? '成功' : '失败'}</span>
}

function QuickAction({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return <div className="flex items-center gap-3 border-l-2 border-primary/40 bg-surface-container-low px-4 py-3"><ConsoleIcon name={icon} className="h-5 w-5 text-primary" /><div><p className="text-sm font-semibold text-on-surface">{title}</p><p className="text-xs text-on-surface-variant">{detail}</p></div></div>
}
