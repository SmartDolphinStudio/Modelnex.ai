import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useConsoleStore } from './store'
import ConsoleIcon from './ConsoleIcon'

const pieColors = ['#7f5445', '#0f766e', '#d97706', '#2563eb']
const tooltipStyle = { borderRadius: 8, border: '1px solid #d5c2bd', fontSize: 12 }

function compact(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toLocaleString()
}

export default function UsageShowcase() {
  const { apiKeys, avgResponseTime, charts, logs, todayRequests, totalTokens } = useConsoleStore()
  const totalCost = apiKeys.reduce((sum, item) => sum + item.cost, 0)
  const summary = [
    { label: '总请求数', value: todayRequests.toLocaleString(), unit: 'Requests', icon: 'query_stats' },
    { label: '总 Token', value: compact(totalTokens), unit: 'Token', icon: 'token' },
    { label: '总消耗', value: `$${totalCost.toFixed(2)}`, unit: 'USD', icon: 'payments' },
    { label: '平均耗时', value: `${avgResponseTime.toFixed(2)}s`, unit: 'Response', icon: 'timer' },
  ]

  function exportCsv() {
    const columns = ['密钥', '模型', '强度', '端点', 'IP', '分组', '类型', '计费', 'Token', '费用', '延迟', '时间']
    const rows = logs.map((item) => [item.keyName, item.model, item.intensity, item.endpoint, item.ip, item.group, item.requestType, item.billing, item.tokens, item.cost.toFixed(3), item.latency, item.time])
    const blob = new Blob([[columns, ...rows].map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `modelnex-usage-${Date.now()}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 border-b border-outline-variant/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Usage analytics</p><h1 className="mt-1 text-2xl font-semibold text-primary">使用统计</h1><p className="mt-1 text-sm text-on-surface-variant">模型分布、Token 趋势与每次调用的可核对明细。</p></div>
        <button onClick={exportCsv} className="inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:border-primary hover:text-primary"><ConsoleIcon name="download" className="h-4 w-4" />导出明细</button>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summary.map((item) => <div key={item.label} className="rounded-lg border border-outline-variant bg-surface p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-on-surface-variant">{item.label}</span><ConsoleIcon name={item.icon} className="h-4 w-4 text-primary" /></div><p className="mt-7 text-2xl font-semibold text-primary">{item.value}</p><p className="mt-1 text-xs text-on-surface-variant">{item.unit}</p></div>)}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-outline-variant bg-surface p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-on-surface">模型分布</h2><p className="mt-1 text-xs text-on-surface-variant">按 Token 消耗汇总</p></div><ConsoleIcon name="donut_small" className="h-5 w-5 text-primary" /></div><div className="grid items-center gap-4 sm:grid-cols-[1fr_180px]"><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={charts.modelUsage} dataKey="tokens" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>{charts.modelUsage.map((item, index) => <Cell key={item.name} fill={pieColors[index % pieColors.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => [compact(Number(value || 0)), 'Token']} /></PieChart></ResponsiveContainer></div><div className="space-y-3">{charts.modelUsage.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 text-on-surface-variant"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />{item.name}</span><span className="font-semibold text-on-surface">{compact(item.tokens)}</span></div>)}</div></div></div>
        <div className="rounded-lg border border-outline-variant bg-surface p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-on-surface">Token 使用趋势</h2><p className="mt-1 text-xs text-on-surface-variant">最近 7 天的总消耗变化</p></div><ConsoleIcon name="trending_up" className="h-5 w-5 text-primary" /></div><ResponsiveContainer width="100%" height={264}><LineChart data={charts.usageTrend}><CartesianGrid vertical={false} stroke="#e5ded7" strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={42} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value || 0).toLocaleString(), 'Token']} /><Line type="monotone" dataKey="tokens" stroke="#7f5445" strokeWidth={2.4} dot={{ r: 3, fill: '#7f5445' }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div>
      </section>

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface"><div className="flex items-center justify-between border-b border-outline-variant px-5 py-4"><div><h2 className="text-sm font-semibold text-on-surface">调用明细</h2><p className="mt-1 text-xs text-on-surface-variant">按密钥、端点、计费与性能字段完整展开。</p></div><span className="text-xs text-on-surface-variant">{logs.length} 条展示记录</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1480px]"><thead className="bg-surface-container-low"><tr>{['密钥', '模型', '强度', '端点', 'IP', '分组', '类型', '计费', 'Token', '费用', '延迟', '时间'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{heading}</th>)}</tr></thead><tbody>{logs.map((entry) => <tr key={entry.id} className="border-t border-outline-variant/50 hover:bg-surface-container-low"><td className="px-4 py-3 text-sm font-medium text-on-surface">{entry.keyName}</td><td className="px-4 py-3 text-sm text-on-surface">{entry.model}</td><td className="px-4 py-3 text-xs text-on-surface-variant">{entry.intensity}</td><td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{entry.endpoint}</td><td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{entry.ip}</td><td className="px-4 py-3 text-xs text-on-surface-variant">{entry.group}</td><td className="px-4 py-3 text-xs text-on-surface-variant">{entry.requestType}</td><td className="px-4 py-3 text-xs text-on-surface-variant">{entry.billing}</td><td className="px-4 py-3 text-sm text-on-surface">{entry.tokens.toLocaleString()}</td><td className="px-4 py-3 text-sm text-on-surface">${entry.cost.toFixed(3)}</td><td className="px-4 py-3 text-sm text-on-surface">{entry.latency}</td><td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{entry.time}</td></tr>)}</tbody></table></div></section>
    </div>
  )
}
