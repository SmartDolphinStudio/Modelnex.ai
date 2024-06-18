import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import en from './en.json'
import zh from './zh.json'
import zhTW from './zh-TW.json'
import de from './de.json'
import nl from './nl.json'

export type Lang = 'en' | 'zh' | 'zh-TW' | 'de' | 'nl'
type Dict = Record<string, any>

const translations: Record<Lang, Dict> = { en, zh, 'zh-TW': zhTW, de, nl }

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  zh: '简体中文',
  'zh-TW': '繁體中文',
  de: 'Deutsch',
  nl: 'Nederlands',
}
interface I18nCtx {
  lang: Lang
  t: (key: string) => any
  setLang: (l: Lang) => void
}

const Ctx = createContext<I18nCtx>({ lang: 'en', t: (k) => k, setLang: () => {} })

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('mn-lang')
    return (saved && translations[saved as Lang]) ? saved as Lang : 'en'
  })
  const dict = translations[lang]
  const t = useCallback((key: string) => getByPath(dict, key) ?? getByPath(en, key) ?? key, [dict])
  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('mn-lang', l)
    setLangState(l)
  }, [])

  return <Ctx.Provider value={{ lang, t, setLang }}>{children}</Ctx.Provider>
}

export function useI18n() {
  return useContext(Ctx)
}
