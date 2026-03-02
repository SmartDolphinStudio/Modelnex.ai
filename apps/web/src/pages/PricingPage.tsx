import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'

const tiers = [
  { id: 'basic', name: '基础版', nameEn: 'Basic', price: 29, credit: 1000, features: ['1,000 Credit/月', '基础模型访问', '5 个 API Key'] },
  { id: 'standard', name: '标准版', nameEn: 'Standard', price: 99, credit: 5000, features: ['5,000 Credit/月', '标准模型访问', '10 个 API Key', '优先支持'] },
  { id: 'premium', name: '高级版', nameEn: 'Premium', price: 299, credit: 20000, features: ['20,000 Credit/月', '全部模型访问', '高级用量分析'] },
  { id: 'enterprise', name: '企业版', nameEn: 'Enterprise', price: 999, credit: 100000, features: ['100,000 Credit/月', '不限 API Key', '专属支持'] },
]
const apiCreditOptions = [100, 500, 1000, 5000]

type PricingTab = 'subscription' | 'api'

export default function PricingPage() {
  const { lang } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<PricingTab>('subscription')
  const [apiAmount, setApiAmount] = useState(500)
  const [apiCustom, setApiCustom] = useState('')
  const isEn = lang === 'en'
  const actualApiAmount = apiCustom ? Number(apiCustom) : apiAmount

  useEffect(() => {
    setTab(params.get('tab') === 'api' ? 'api' : 'subscription')
  }, [params])

  const requireLogin = () => {
    if (localStorage.getItem('mn-logged-in') === 'true') return true
    navigate(`/login?next=${encodeURIComponent('/pricing?tab=api')}`)
    return false
  }

  const buyApiCredit = () => {
    if (!requireLogin() || !actualApiAmount || actualApiAmount <= 0) return
    navigate('/payment', {
      state: {
        kind: 'api-credit',
        amount: actualApiAmount,
        method: 'alipay',
        returnTo: '/pricing?tab=api',
      },
    })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-8">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {isEn ? 'Back to Home' : '返回首页'}
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-primary mb-4">{isEn ? 'ModelNex.AI Pricing' : 'ModelNex.AI 定价'}</h1>
          <p className="text-on-surface-variant">{isEn ? 'Subscriptions and API credits are billed separately.' : '订阅套餐和 API 额度是两套购买入口，按实际需要选择。'}</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-full border border-outline-variant bg-surface-container-low p-1">
            <button onClick={() => setTab('subscription')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'subscription' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'}`}>
              {isEn ? 'Subscription' : '订阅套餐'}
            </button>
            <button onClick={() => setTab('api')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'api' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'}`}>
              {isEn ? 'API Credit' : 'API 购买'}
            </button>
          </div>
        </div>

        {tab === 'subscription' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div key={tier.id} className="bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-primary mb-2">{isEn ? tier.nameEn : tier.name}</h3>
                <div className="text-3xl font-bold text-on-surface mb-2">¥{tier.price}<span className="text-sm text-on-surface-variant">/月</span></div>
                <div className="text-sm text-tertiary font-semibold mb-4">{tier.credit.toLocaleString()} Credit/月</div>
                <ul className="text-sm text-on-surface-variant space-y-2 mb-6 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">check</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { if (requireLogin()) navigate('/payment', { state: { kind: 'subscription', tier: tier.id, returnTo: '/pricing' } }) }} className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">{isEn ? 'Subscribe' : '订阅'}</button>
              </div>
            ))}
          </section>
        ) : (
          <section className="mx-auto max-w-3xl rounded-xl border border-outline-variant bg-surface p-6">
            <h2 className="text-2xl font-semibold text-primary mb-2">{isEn ? 'Purchase API Credit' : '购买 API 额度'}</h2>
            <p className="text-on-surface-variant mb-2">{isEn ? 'Credits are consumed by model, token count and pricing multiplier.' : 'API 额度按模型、Token 数量和倍率扣费。'}</p>
            <p className="mb-6 text-sm font-medium text-primary">{isEn ? 'Subscription quota is used first, then API credit.' : '优先使用订阅额度，再使用 API 额度。'}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {apiCreditOptions.map((amount) => (
                <button key={amount} onClick={() => { setApiAmount(amount); setApiCustom('') }} className={`rounded-lg border px-4 py-3 text-sm font-semibold ${!apiCustom && apiAmount === amount ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:text-primary'}`}>
                  {amount.toLocaleString()} Credit
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={apiCustom} onChange={(event) => setApiCustom(event.target.value)} type="number" min="1" className="h-11 flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-4 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder={isEn ? 'Custom amount' : '自定义额度'} />
              <button onClick={buyApiCredit} className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-on-primary disabled:opacity-60">
                {`${isEn ? 'Buy' : '购买'} ${actualApiAmount || 0} Credit`}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
