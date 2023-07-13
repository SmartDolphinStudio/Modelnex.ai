import { Component, ReactNode, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useConsoleStore } from './store'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import DashboardShowcase from './DashboardShowcase'
import ApiKeys from './ApiKeys'
import UsageShowcase from './UsageShowcase'
import Recharge from './Recharge'
import Redemption from './Redemption'
import Referrals from './Referrals'
import Billing from './Billing'

const CONSOLE_BUILD_MARK = 'modelnex-console-20260702-api-key-table-v2'

class ConsoleErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mn-console-shell min-h-screen bg-background text-on-surface">
        <aside className="hidden h-screen w-64 border-r border-outline-variant bg-surface-container-low p-6 lg:block">
          <p className="text-sm font-semibold text-primary">ModelNex.AI</p>
          <p className="mt-2 text-xs text-on-surface-variant">Console recovery mode</p>
        </aside>
        <main className="p-6">
          <div className="rounded-lg border border-outline-variant bg-surface p-6">
            <h1 className="text-xl font-semibold text-primary">Console temporarily recovered</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              The console shell is available, but one panel failed to render. Refresh the page after clearing stale browser cache.
            </p>
            <pre className="mt-4 overflow-auto rounded bg-surface-container-low p-3 text-xs text-on-surface-variant">
              {this.state.error.message}
            </pre>
          </div>
        </main>
      </div>
    )
  }
}

export default function ConsolePage() {
  const { page } = useParams()
  const { activePage, setActivePage, hydrateFromServer } = useConsoleStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    hydrateFromServer()
  }, [hydrateFromServer])

  useEffect(() => {
    if (page && ['dashboard', 'api-keys', 'usage', 'recharge', 'redemption', 'billing', 'referrals'].includes(page)) {
      setActivePage(page)
    }
  }, [page, setActivePage])

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardShowcase />
      case 'api-keys': return <ApiKeys />
      case 'usage': return <UsageShowcase />
      case 'recharge': return <Recharge />
      case 'redemption': return <Redemption />
      case 'billing': return <Billing />
      case 'referrals': return <Referrals />
      default: return <DashboardShowcase />
    }
  }

  return (
    <ConsoleErrorBoundary>
    <div className="mn-console-shell min-h-screen bg-background text-on-surface text-[15px]" data-build={CONSOLE_BUILD_MARK}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`mn-console-sidebar-shell fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="min-w-0 lg:pl-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6 max-w-[1440px] mx-auto min-h-[calc(100vh-56px)]">
          {renderPage()}
        </main>
      </div>
    </div>
    </ConsoleErrorBoundary>
  )
}
