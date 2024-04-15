import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

export default function FAQ() {
  const { t } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const items = (t('faq.items') as Array<{ q: string; a: string }>).map((item) => ({ question: item.q, answer: item.a }))

  return (
    <section aria-label={t('faq.sectionSubtitle')} data-testid="faq-section" className="pb-24 pt-32 sm:pt-40">
      <div className="mx-auto w-full max-w-4xl space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={item.question}
              className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                isOpen
                  ? 'border-primary/40 bg-surface-container'
                  : 'border-outline-variant/70 bg-surface-container-low hover:border-outline-variant hover:bg-surface-container/60'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className={`flex w-full items-center justify-between gap-6 px-5 py-4 text-left text-base font-bold transition-colors sm:px-6 sm:py-5 sm:text-lg ${
                  isOpen ? 'text-primary' : 'text-on-surface hover:text-primary'
                }`}
              >
                <span>{item.question}</span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen
                      ? 'rotate-180 border-primary/50 bg-primary/10 text-primary'
                      : 'border-outline-variant text-on-surface-variant'
                  }`}
                >
                  <ChevronDown size={18} strokeWidth={2} />
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-7 text-on-surface-variant sm:px-6 sm:pb-6">{item.answer}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
