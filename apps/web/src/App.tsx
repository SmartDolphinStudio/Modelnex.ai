import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { I18nProvider } from './i18n/useI18n'
import Header from './components/Header'
import Hero from './components/Hero'
import APIOverview from './components/APIOverview'
import ValueProposition from './components/ValueProposition'
import ModelWorkspace from './components/ModelWorkspace'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'
import ChatPet from './components/ChatPet'
import LoginPage from './pages/LoginPage'
import ErrorPage from './pages/ErrorPage'
import MaintenancePage from './pages/MaintenancePage'
import UserProfilePage from './pages/UserProfilePage'
import ConsolePage from './features/console/ConsolePage'
import ChatPage from './pages/ChatPage'
import DocsPage from './pages/DocsPage'
import PaymentPage from './pages/PaymentPage'
import PricingPage from './pages/PricingPage'
import ApiCreditPage from './pages/ApiCreditPage'
import RankingsPage from './pages/RankingsPage'

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1280px] mx-auto px-6">
        <Hero />
        <APIOverview />
        <ValueProposition />
        <ModelWorkspace />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
      <CookieBanner />
    </div>
  )
}

function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-28">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">ModelNex.AI</p>
        <h1 className="font-display text-4xl text-primary mb-4">更新日志</h1>
        <p className="text-on-surface-variant leading-7">
          更新日志页面已预留，后续会接入正式发布记录和版本说明。
        </p>
      </main>
    </div>
  )
}

function SupportPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-28">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">Support</p>
        <h1 className="font-display text-4xl text-primary mb-4">联系管理员</h1>
        <p className="text-on-surface-variant leading-7">
          当前工单页面为空壳。请记录错误代码和操作时间，后续这里会接入正式支持系统。
        </p>
      </main>
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('mn-logged-in') === 'true'
  if (!isLoggedIn) {
    const next = `${window.location.pathname}${window.location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  return <>{children}</>
}

function App() {
  const hostname = window.location.hostname
  const isDocDomain = hostname === 'docs.modelnex.ai'
  const isLogDomain = hostname.startsWith('log.')

  return (
    <I18nProvider>
      <BrowserRouter>
        {isDocDomain ? (
          <Routes>
            <Route path="*" element={<DocsPage />} />
          </Routes>
        ) : isLogDomain ? (
          <Routes>
            <Route path="*" element={<ChangelogPage />} />
          </Routes>
        ) : (
          <>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage />} />
            <Route path="/console" element={<RequireAuth><ConsolePage /></RequireAuth>} />
            <Route path="/console/profile" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
            <Route path="/console/:page" element={<RequireAuth><ConsolePage /></RequireAuth>} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/api-credit" element={<RequireAuth><ApiCreditPage /></RequireAuth>} />
            <Route path="/payment" element={<RequireAuth><PaymentPage /></RequireAuth>} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/models" element={<RankingsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/302" element={<ErrorPage code="302" />} />
            <Route path="/401" element={<ErrorPage code="401" />} />
            <Route path="/402" element={<ErrorPage code="402" />} />
            <Route path="/403" element={<ErrorPage code="403" />} />
            <Route path="/404" element={<ErrorPage code="404" />} />
            <Route path="/408" element={<ErrorPage code="408" />} />
            <Route path="/409" element={<ErrorPage code="409" />} />
            <Route path="/410" element={<ErrorPage code="410" />} />
            <Route path="/500" element={<ErrorPage code="500" />} />
            <Route path="/503" element={<ErrorPage code="503" />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="*" element={<ErrorPage code="404" />} />
            </Routes>
            <ChatPet />
          </>
        )}
      </BrowserRouter>
    </I18nProvider>
  )
}

export default App
