import { useNavigate } from 'react-router-dom'
import { useConsoleStore } from './store'
import { useI18n } from '../../i18n/useI18n'
import ConsoleIcon from './ConsoleIcon'

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { t } = useI18n()
  const { activePage, setActivePage } = useConsoleStore()
  const navigate = useNavigate()

  const navItems = [
    { id: 'dashboard', label: t('console.sidebar.dashboard'), icon: 'dashboard' },
    { id: 'api-keys', label: t('console.sidebar.apiKeys'), icon: 'vpn_key' },
    { id: 'usage', label: t('console.sidebar.usage'), icon: 'bar_chart' },
    { id: 'recharge', label: t('console.sidebar.recharge'), icon: 'payments' },
    { id: 'redemption', label: t('console.sidebar.redemption'), icon: 'confirmation_number' },
    { id: 'billing', label: t('console.sidebar.pastBilling'), icon: 'receipt_long' },
    { id: 'referrals', label: t('console.sidebar.referrals'), icon: 'group_add' }
  ]

  const handleClick = (id: string) => {
    setActivePage(id)
    navigate(`/console/${id}`)
    onClose?.()
  }

  return (
    <aside className="h-screen w-64 bg-surface-container-low border-r border-outline-variant flex flex-col overflow-hidden">
      <div className="flex flex-col h-full py-8 px-4">
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                activePage === item.id
                  ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-highest/30'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              <ConsoleIcon name={item.icon} className="h-4 w-4 shrink-0 opacity-80" />
              <span className="font-label-md">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
