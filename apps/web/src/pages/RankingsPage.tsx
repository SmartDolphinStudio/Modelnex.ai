import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import Header from '../components/Header'
import Footer from '../components/Footer'

type SortMode = 'users' | 'tokens'

interface ModelRank {
  id: string
  name: string
  provider: string
  users: number
  requests: number
  tokens: number
  revenueUsd: number
  profitUsd: number
  currentRank: number
  rankChange: number
  weeklyChange: number
}

const providerBadges: Record<string, { text: string; className: string }> = {
  OpenAI: { text: 'OA', className: 'bg-[#111111] text-white' },
  Anthropic: { text: 'A', className: 'bg-[#d9c6b8] text-[#2b2118]' },
  Google: { text: 'G', className: 'bg-white text-[#4285f4] border border-[#dadce0]' },
  ModelNex: { text: 'MN', className: 'bg-primary text-on-primary' },
  'YMan API': { text: 'YM', className: 'bg-[#0f766e] text-white' },
  DeepSeek: { text: 'DS', className: 'bg-[#2563eb] text-white' },
}

const showcaseModels: ModelRank[] = [
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', users: 12840, requests: 924000, tokens: 184000000, revenueUsd: 18400, profitUsd: 7350, currentRank: 1, rankChange: 0, weeklyChange: 0 },
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', users: 9840, requests: 718000, tokens: 156000000, revenueUsd: 15120, profitUsd: 6048, currentRank: 2, rankChange: 0, weeklyChange: 0 },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', users: 7610, requests: 593000, tokens: 132000000, revenueUsd: 12240, profitUsd: 4896, currentRank: 3, rankChange: 0, weeklyChange: 0 },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', users: 5380, requests: 446000, tokens: 91000000, revenueUsd: 8190, profitUsd: 3276, currentRank: 4, rankChange: 0, weeklyChange: 0 },
]

export default function RankingsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [sortMode, setSortMode] = useState<SortMode>('users')
  const [models] = useState<ModelRank[]>(showcaseModels)

  const sortedModels = useMemo(() => {
    return [...models].sort((a, b) => sortMode === 'users' ? b.users - a.users || b.tokens - a.tokens : b.tokens - a.tokens || b.users - a.users)
  }, [models, sortMode])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return String(num || 0)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">{t('rankings.title')}</h1>
            <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">展示模型调用、用户覆盖和 Token 消耗的界面示例。</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-surface-container-low border border-outline-variant rounded-full p-1 flex gap-1">
              <button onClick={() => setSortMode('users')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${sortMode === 'users' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                按使用人数
              </button>
              <button onClick={() => setSortMode('tokens')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${sortMode === 'tokens' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                按 Token
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container">
                    {['排名', '模型', sortMode === 'users' ? '使用人数' : 'Token', '请求数', '收入', '利润'].map((h) => (
                      <th key={h} className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {sortedModels.map((model, index) => (
                    <tr key={model.id || model.name} className="hover:bg-surface-container transition-colors cursor-pointer" onClick={() => { window.location.href = 'https://docs.modelnex.ai#models' }}>
                      <td className="py-4 px-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>{index + 1}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold tracking-tight ${providerBadges[model.provider]?.className || 'bg-surface-container-highest text-primary border border-outline-variant'}`}>
                            {providerBadges[model.provider]?.text || initials(model.provider || model.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface">{model.name}</div>
                            <div className="text-xs text-on-surface-variant">{model.provider}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-primary">{sortMode === 'users' ? formatNumber(model.users) : formatNumber(model.tokens)}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{formatNumber(model.requests)}</td>
                      <td className="py-4 px-6 text-on-surface-variant">${(model.revenueUsd || 0).toFixed(4)}</td>
                      <td className={`py-4 px-6 font-semibold ${(model.profitUsd || 0) >= 0 ? 'text-tertiary' : 'text-error'}`}>${(model.profitUsd || 0).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-on-surface-variant opacity-60">静态展示数据</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function initials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  return (value.trim().slice(0, 2) || 'AI').toUpperCase()
}
