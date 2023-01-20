import { useI18n } from '../i18n/useI18n'

export default function ValueProposition() {
  const { t } = useI18n()

  const features = [
    {
      icon: 'auto_awesome',
      title: t('valueProp.features.0.title'),
      desc: t('valueProp.features.0.desc'),
    },
    {
      icon: 'description',
      title: t('valueProp.features.1.title'),
      desc: t('valueProp.features.1.desc'),
    },
    {
      icon: 'bolt',
      title: t('valueProp.features.2.title'),
      desc: t('valueProp.features.2.desc'),
    },
  ]

  return (
    <section className="py-20 bg-surface-container-low rounded-[40px] px-8 reveal">
      <div className="text-center mb-20">
        <h2 className="font-display text-5xl italic">{t('valueProp.title')}</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-20">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">{f.icon}</span>
            </div>
            <h3 className="font-display text-2xl mt-4">{f.title}</h3>
            <p className="text-on-surface-variant">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
