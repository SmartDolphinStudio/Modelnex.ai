import { useI18n } from '../i18n/useI18n'
import { useNavigate } from 'react-router-dom'

/** 展示用套餐键（对应 i18n `pricing.plans.*`）。 */
const PLAN_KEYS = ['medium', 'high', 'max', 'enterprise'] as const
type PlanKey = (typeof PLAN_KEYS)[number]

/** 结算/支付页使用的套餐 id。 */
const TIER_ID: Record<PlanKey, string> = {
  medium: 'basic',
  high: 'standard',
  max: 'premium',
  enterprise: 'enterprise',
}

const BTN_STYLE: Record<PlanKey, 'border' | 'filled' | 'dark'> = {
  medium: 'border',
  high: 'filled',
  max: 'border',
  enterprise: 'dark',
}

interface PlanView {
  key: PlanKey
  tierId: string
  name: string
  desc: string
  quota: string
  quotaLabel: string
  features: string[]
  btnText: string
  btnStyle: 'border' | 'filled' | 'dark'
  popular: boolean
}

export default function Pricing() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const plans: PlanView[] = PLAN_KEYS.map((key) => ({
    key,
    tierId: TIER_ID[key],
    name: t(`pricing.plans.${key}.name`),
    desc: t(`pricing.plans.${key}.desc`),
    quota: t(`pricing.plans.${key}.quota`),
    quotaLabel: t(`pricing.plans.${key}.quotaLabel`),
    features: t(`pricing.plans.${key}.features`) as string[],
    btnText: t(`pricing.plans.${key}.btnText`),
    btnStyle: BTN_STYLE[key],
    popular: key === 'high',
  }))

  return (
    <section id="pricing" className="py-20 reveal">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl">{t('pricing.sectionTitle')}</h2>
        <p className="text-on-surface-variant mt-2">{t('pricing.sectionSubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`p-6 rounded-xl flex flex-col h-full transition-all ${
              plan.popular
                ? 'bg-surface-container ring-2 ring-primary relative md:-translate-y-2'
                : plan.key === 'enterprise'
                ? 'bg-surface-container-highest'
                : 'bg-surface-container border border-transparent hover:border-primary/20'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {t('pricing.mostPopular')}
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-primary text-2xl tracking-tight">{plan.name}</h3>
              <p className="text-on-surface-variant text-xs mt-1 leading-5">{plan.desc}</p>
            </div>
            <div className="mb-6">
              <div className="text-3xl font-semibold text-on-surface">{plan.quota}</div>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wide mt-0.5">
                {plan.quotaLabel}
              </p>
            </div>
            <ul className="flex-1 space-y-3 mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-5">
                  <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">
                    check_circle
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/payment', { state: { tier: plan.tierId } })}
              className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
                plan.btnStyle === 'filled'
                  ? 'bg-primary text-white hover:opacity-90'
                  : plan.btnStyle === 'dark'
                  ? 'bg-on-surface text-white hover:opacity-90'
                  : 'border border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              {plan.btnText}
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-2">
        <a className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer" onClick={() => navigate('/pricing?tab=api')}>
          {t('pricing.purchaseCredits')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </div>
    </section>
  )
}
