import { useI18n } from '../i18n/useI18n'
import { useNavigate } from 'react-router-dom'

export default function APIOverview() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <section className="py-20 reveal">
      <div className="mb-12">
        <span className="text-primary font-semibold uppercase tracking-widest text-sm">{t('apiOverview.stationAlpha')}</span>
        <h2 className="font-display text-3xl mt-2">{t('apiOverview.title')}</h2>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-7 bg-surface-container p-8 rounded-xl flex flex-col justify-between bento-card">
          <div>
            <span className="material-symbols-outlined text-primary text-4xl mb-4">terminal</span>
            <h3 className="font-display text-2xl mb-4">{t('apiOverview.cardTitle')}</h3>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              {t('apiOverview.cardDesc')}
            </p>
          </div>
          <button onClick={() => { window.location.href = 'https://docs.modelnex.ai' }} className="flex items-center gap-2 text-primary font-semibold cursor-pointer group text-left">
            {t('apiOverview.exploreDocs')}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
        <div className="col-span-12 md:col-span-5 flex flex-col gap-6">
          <div className="bg-primary-container/20 p-8 rounded-xl flex-1 bento-card">
            <span className="material-symbols-outlined text-primary mb-2">neurology</span>
            <h4 className="font-display text-xl mb-2">{t('apiOverview.whatIsTitle')}</h4>
            <p className="text-on-surface-variant">{t('apiOverview.whatIsDesc')}</p>
          </div>
          <div className="bg-surface-variant p-8 rounded-xl flex-1 bento-card">
            <span className="material-symbols-outlined text-primary mb-2">model_training</span>
            <h4 className="font-display text-xl mb-2">{t('apiOverview.multimodalTitle')}</h4>
            <p className="text-on-surface-variant">{t('apiOverview.multimodalDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
