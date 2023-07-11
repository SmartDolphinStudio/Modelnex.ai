import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { useConsoleStore } from './store'
import ConsoleIcon from './ConsoleIcon'

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { t } = useI18n()
  const { balance } = useConsoleStore()
  const navigate = useNavigate()

  return (
    <header className="h-14 sticky top-0 z-30 bg-surface border-b border-outline-variant flex items-center justify-between px-4 lg:px-10">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-on-surface-variant hover:text-primary transition-all" onClick={onMenuClick}>
          <ConsoleIcon name="menu" className="h-5 w-5" />
        </button>
        <div className="relative hidden sm:block">
          <ConsoleIcon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input className="bg-surface-container-low border-none rounded-full py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/40 w-64" placeholder={t('console.topbar.searchPlaceholder')} type="text" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-baseline gap-1 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-sm sm:flex">
          <span className="font-semibold text-primary">{balance.toFixed(2)}</span>
          <span className="text-xs text-on-surface-variant">Credit</span>
        </div>
        <a
          href="https://docs.modelnex.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-outline-variant bg-white text-[9px] font-semibold leading-none text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          aria-label="Open ModelNex documentation"
        >
          ?
        </a>
        <button onClick={() => navigate('/console/profile')} className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant flex items-center justify-center text-primary font-bold text-sm hover:border-primary transition-colors">
          U
        </button>
      </div>
    </header>
  )
}
