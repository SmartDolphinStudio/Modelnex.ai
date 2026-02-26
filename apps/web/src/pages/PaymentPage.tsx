import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { showToast } from '../lib/toast'

type CheckoutKind = 'subscription' | 'api-credit'
type PaymentTab = 'web3' | 'cards' | 'digital'
type DigitalMethod =
  | 'alipay'
  | 'wechat'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'amazon_pay'
  | 'samsung_pay'
  | 'cash_app'
  | 'venmo'
  | 'klarna'
  | 'pix'
  | 'upi'

type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'GBP' | 'JPY' | 'HKD' | 'KRW' | 'SGD' | 'AUD' | 'CAD' | 'CHF' | 'TWD' | 'THB' | 'MYR' | 'PHP' | 'IDR' | 'USDT' | 'USDC'

type PaymentIntent = {
  orderId: string
  idempotencyKey: string
  nonce: string
  amountCents: number
  currency: CurrencyCode
  paymentMethod: string
  signature: string
  canonicalHash: string
  guardEngine: string
  status: 'preview' | 'active' | 'voided' | 'paid'
}

type LockedPaymentOrder = {
  intent: PaymentIntent
  expiresAt: number
}

type ChainOption = {
  id: string
  label: string
  token: 'BTC' | 'ETH' | 'SOL'
  gasUnit: string
  feeLabel: string
  address: string
}

type OracleQuote = {
  asset: string
  network: string
  feeLabel: string
  feeAsset: string
  estimatedFee: string
  priceUsd: number
  source: string
  updatedAt: string
  fxBase: string
  fxQuote: string
  fxRate: number
  status: string
}

const ORDER_LOCK_MS = 60 * 60 * 1000
const LOCK_STORAGE_KEY = 'mn-payment-locked-order'

const tiers = [
  { id: 'basic', name: '基础版', price: 29, credit: 1000, period: '月', note: '轻量调用与基础模型访问' },
  { id: 'standard', name: '标准版', price: 99, credit: 5000, period: '月', note: '标准模型、API Key 与优先队列' },
  { id: 'premium', name: '高级版', price: 299, credit: 20000, period: '月', note: '更高额度、更多模型与用量分析' },
  { id: 'enterprise', name: '企业版', price: 999, credit: 100000, period: '月', note: '企业额度、专属支持与高并发策略' },
]

const currencies: Array<{ code: CurrencyCode; label: string; fallbackRate: number }> = [
  { code: 'USD', label: 'US Dollar', fallbackRate: 1 },
  { code: 'CNY', label: '人民币', fallbackRate: 7.25 },
  { code: 'EUR', label: 'Euro', fallbackRate: 0.92 },
  { code: 'GBP', label: 'British Pound', fallbackRate: 0.78 },
  { code: 'JPY', label: 'Japanese Yen', fallbackRate: 157 },
  { code: 'HKD', label: 'Hong Kong Dollar', fallbackRate: 7.81 },
  { code: 'KRW', label: 'Korean Won', fallbackRate: 1380 },
  { code: 'SGD', label: 'Singapore Dollar', fallbackRate: 1.35 },
  { code: 'AUD', label: 'Australian Dollar', fallbackRate: 1.51 },
  { code: 'CAD', label: 'Canadian Dollar', fallbackRate: 1.37 },
  { code: 'CHF', label: 'Swiss Franc', fallbackRate: 0.89 },
  { code: 'TWD', label: 'New Taiwan Dollar', fallbackRate: 32.4 },
  { code: 'THB', label: 'Thai Baht', fallbackRate: 36.7 },
  { code: 'MYR', label: 'Malaysian Ringgit', fallbackRate: 4.71 },
  { code: 'PHP', label: 'Philippine Peso', fallbackRate: 58.6 },
  { code: 'IDR', label: 'Indonesian Rupiah', fallbackRate: 16250 },
  { code: 'USDT', label: 'Tether USD', fallbackRate: 1 },
  { code: 'USDC', label: 'USD Coin', fallbackRate: 1 },
]

const cryptoCoins = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    asset: '/payment-assets/crypto/btc_bitcoin.png',
    usdRate: 62000,
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    asset: '/payment-assets/crypto/eth_ethereum.png',
    usdRate: 3400,
  },
  {
    id: 'SOL',
    name: 'Solana',
    asset: '/payment-assets/crypto/sol_solana.png',
    usdRate: 150,
  },
] as const

const chainOptions: ChainOption[] = [
  { id: 'bitcoin', label: 'Bitcoin Network', token: 'BTC', gasUnit: 'BTC', feeLabel: 'Miner fee', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  { id: 'ethereum', label: 'Ethereum Mainnet', token: 'ETH', gasUnit: 'ETH', feeLabel: 'Gas', address: '0x6d6f64656c6e65786169436865636b6f7574' },
  { id: 'arbitrum', label: 'Arbitrum One', token: 'ETH', gasUnit: 'ETH', feeLabel: 'Gas', address: '0xA57RAE05B172A744E0084B7006922B1E9A9DB237' },
  { id: 'optimism', label: 'Optimism', token: 'ETH', gasUnit: 'ETH', feeLabel: 'Gas', address: '0xB11D05F1F9C1CD2D9B71A35B92394335946AF8CE' },
  { id: 'base', label: 'Base', token: 'ETH', gasUnit: 'ETH', feeLabel: 'Gas', address: '0xBA5EModelNexCheckout00000000000000000001' },
  { id: 'polygon', label: 'Polygon PoS', token: 'ETH', gasUnit: 'POL', feeLabel: 'Gas', address: '0xEVM0DE1NEXA1CRED1T5AFE9A9DB237794EFCE16F' },
  { id: 'bsc', label: 'BNB Smart Chain', token: 'ETH', gasUnit: 'BNB', feeLabel: 'Gas', address: '0xB5C0DE1NEXA1CHECK0UT6922B1E9A9DB237794' },
  { id: 'avalanche', label: 'Avalanche C-Chain', token: 'ETH', gasUnit: 'AVAX', feeLabel: 'Gas', address: '0xAVAModelNexCheckout000000000000000000001' },
  { id: 'solana', label: 'Solana Mainnet', token: 'SOL', gasUnit: 'SOL', feeLabel: 'Priority fee', address: 'MNXpay8zM3o9Sv2sVX4kDKy5rQ9uP4iCheck' },
]

const cardBrands = [
  'visa.png',
  'mastercard.png',
  'unionpay.png',
  'jcb.png',
  'discover.png',
  'maestro.png',
  'elo.png',
  'hipercard.png',
  'aura.png',
  'bancontact.png',
  'bc_card.png',
  'cabal.png',
  'ideal.png',
  'napas.png',
  'oxxo.png',
  'rupay.png',
  'sofort.png',
  'tarjeta_naranja.png',
  'touch_n_go.png',
]

const digitalMethods: Array<{ id: DigitalMethod; label: string; asset: string; official?: string; qr?: string }> = [
  { id: 'alipay', label: 'Alipay', asset: '/payment-assets/qr-payment/alipay.png', qr: '/payment-assets/qr-payment/alipay.png' },
  { id: 'wechat', label: 'WeChat Pay', asset: '/payment-assets/qr-payment/wechat_pay.png', qr: '/payment-assets/qr-payment/wechat_pay.png' },
  { id: 'apple_pay', label: 'Apple Pay', asset: '/payment-assets/global-pay/apple_pay.png', official: 'https://www.apple.com/apple-pay/' },
  { id: 'google_pay', label: 'Google Pay', asset: '/payment-assets/global-pay/google_pay.png', official: 'https://pay.google.com/' },
  { id: 'paypal', label: 'PayPal', asset: '/payment-assets/global-pay/paypal.png', official: 'https://www.paypal.com/' },
  { id: 'amazon_pay', label: 'Amazon Pay', asset: '/payment-assets/global-pay/amazon_pay.png', official: 'https://pay.amazon.com/' },
  { id: 'samsung_pay', label: 'Samsung Pay', asset: '/payment-assets/global-pay/samsung_pay.png', official: 'https://www.samsung.com/samsung-pay/' },
  { id: 'cash_app', label: 'Cash App', asset: '/payment-assets/global-pay/cash_app.png', official: 'https://cash.app/pay' },
  { id: 'venmo', label: 'Venmo', asset: '/payment-assets/global-pay/venmo.png', official: 'https://venmo.com/' },
  { id: 'klarna', label: 'Klarna', asset: '/payment-assets/global-pay/klarna.png', official: 'https://www.klarna.com/' },
  { id: 'pix', label: 'Pix', asset: '/payment-assets/global-pay/pix.png', official: 'https://www.bcb.gov.br/en/financialstability/pix_en' },
  { id: 'upi', label: 'UPI', asset: '/payment-assets/global-pay/upi.png', official: 'https://www.npci.org.in/what-we-do/upi/product-overview' },
]

function readInitialCheckout(locationState: unknown, params: URLSearchParams): { kind: CheckoutKind; tierId: string; apiAmount: number; preferredMethod?: string; returnTo?: string } {
  const state = (locationState || {}) as { kind?: CheckoutKind; tier?: string; amount?: number; method?: string; returnTo?: string }
  const queryKind = params.get('type') === 'api' ? 'api-credit' : 'subscription'
  return {
    kind: state.kind || queryKind,
    tierId: state.tier || params.get('tier') || 'standard',
    apiAmount: Number(state.amount || params.get('amount') || 500),
    preferredMethod: state.method || undefined,
    returnTo: state.returnTo || undefined,
  }
}

function fallbackFxRate(currency: CurrencyCode) {
  return currencies.find((item) => item.code === currency)?.fallbackRate || 1
}

function convertCurrency(usd: number, currency: CurrencyCode, liveRate?: number) {
  const rate = liveRate && liveRate > 0 ? liveRate : fallbackFxRate(currency)
  return Math.round(usd * rate * 100) / 100
}

function money(value: number, currency: CurrencyCode = 'USD') {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency === 'USDT' || currency === 'USDC' ? 'USD' : currency,
    currencyDisplay: 'narrowSymbol',
  }).format(value)
}

function displayMoney(usd: number, currency: CurrencyCode, liveRate?: number) {
  const value = convertCurrency(usd, currency, liveRate)
  if (currency === 'USDT' || currency === 'USDC') return `${value.toFixed(2)} ${currency}`
  return money(value, currency)
}

function makeOrderId() {
  const now = new Date()
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
  const hms = now.toTimeString().slice(0, 8).replace(/:/g, '')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `MNX-PAY-${ymd}-${hms}-${random}`
}

function mockHash(seed: string, length = 64) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let out = ''
  let n = h >>> 0
  while (out.length < length) {
    n = Math.imul(n ^ 0x9e3779b9, 2246822507) >>> 0
    out += n.toString(16).padStart(8, '0')
  }
  return out.slice(0, length)
}

function createPreviewIntent(amountUsd: number, currency: CurrencyCode, method: string, fxRate = fallbackFxRate(currency), replaced?: PaymentIntent | null): PaymentIntent {
  const orderId = makeOrderId()
  const seed = `${orderId}|${amountUsd}|${currency}|${method}|${Date.now()}|${replaced?.orderId || ''}`
  return {
    orderId,
    idempotencyKey: `idem_${mockHash(seed, 32)}`,
    nonce: `nonce_${mockHash(seed + ':nonce', 24)}`,
    amountCents: Math.round(convertCurrency(amountUsd, currency, fxRate) * 100),
    currency,
    paymentMethod: method,
    signature: mockHash(seed + ':signature'),
    canonicalHash: mockHash(seed + ':canonical'),
    guardEngine: 'rust-payment-core/hmac-sha256/v1-preview',
    status: 'active',
  }
}

function refreshIntentPayload(intent: PaymentIntent, amountUsd: number, currency: CurrencyCode, method: string, fxRate = fallbackFxRate(currency)): PaymentIntent {
  const seed = `${intent.orderId}|${amountUsd}|${currency}|${method}|locked`
  return {
    ...intent,
    amountCents: Math.round(convertCurrency(amountUsd, currency, fxRate) * 100),
    currency,
    paymentMethod: method,
    signature: mockHash(seed + ':signature'),
    canonicalHash: mockHash(seed + ':canonical'),
    status: 'active',
  }
}

function readLockedOrder(): LockedPaymentOrder | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOCK_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LockedPaymentOrder
    if (!parsed.intent?.orderId || !parsed.expiresAt || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(LOCK_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    window.localStorage.removeItem(LOCK_STORAGE_KEY)
    return null
  }
}

function saveLockedOrder(intent: PaymentIntent, expiresAt: number) {
  if (typeof window === 'undefined' || expiresAt <= Date.now() || intent.status !== 'active') return
  window.localStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify({ intent, expiresAt }))
}

function clearLockedOrder() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(LOCK_STORAGE_KEY)
}

function formatLockLeft(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60).toString().padStart(2, '0')
  const seconds = (total % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function walletProvider() {
  const w = window as Window & { ethereum?: { request?: (args: { method: string; params?: unknown[] }) => Promise<string[]> } }
  return w.ethereum
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const initial = useMemo(() => readInitialCheckout(location.state, params), [location.state, params])
  const initialLockedOrder = useMemo(() => readLockedOrder(), [])
  const [checkoutKind, setCheckoutKind] = useState<CheckoutKind>(initial.kind)
  const [selectedTier, setSelectedTier] = useState(initial.tierId)
  const [apiAmount, setApiAmount] = useState(Number.isFinite(initial.apiAmount) && initial.apiAmount > 0 ? initial.apiAmount : 500)
  const [tab, setTab] = useState<PaymentTab>('web3')
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [digitalMethod, setDigitalMethod] = useState<DigitalMethod>((initial.preferredMethod as DigitalMethod) || 'alipay')
  const [coin, setCoin] = useState<'BTC' | 'ETH' | 'SOL'>('BTC')
  const [chainId, setChainId] = useState(chainOptions[0].id)
  const [couponId, setCouponId] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [intent, setIntent] = useState<PaymentIntent>(() => initialLockedOrder?.intent || createPreviewIntent(99, 'USD', 'web3_btc'))
  const [lockExpiresAt, setLockExpiresAt] = useState(() => initialLockedOrder?.expiresAt || Date.now() + ORDER_LOCK_MS)
  const [lockTick, setLockTick] = useState(Date.now())
  const [walletAddress, setWalletAddress] = useState('')
  const [walletStatus, setWalletStatus] = useState('等待连接')
  const [oracleQuote, setOracleQuote] = useState<OracleQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [authDialog, setAuthDialog] = useState<{ method: DigitalMethod; attempt: number; manualRound: number; status: 'connecting' | 'manual' | 'failed' } | null>(null)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const authTimer = useRef<number | null>(null)

  const tier = tiers.find((item) => item.id === selectedTier) || tiers[1]
  const baseAmount = checkoutKind === 'subscription' ? tier.price : Math.max(1, Math.round(apiAmount * 100) / 100)
  const credit = checkoutKind === 'subscription' ? tier.credit : Math.round(baseAmount)
  const selectedCoupon = couponId === 'WELCOME10' ? { code: 'WELCOME10', type: 'percent', value: 10 } : null
  const discount = selectedCoupon ? Math.min(baseAmount, Math.round((baseAmount * selectedCoupon.value / 100) * 100) / 100) : 0
  const finalPrice = Math.max(0, Math.round((baseAmount - discount) * 100) / 100)
  const paymentMethod = tab === 'web3' ? `web3_${coin.toLowerCase()}` : tab === 'cards' ? 'card' : digitalMethod
  const activeCoin = cryptoCoins.find((item) => item.id === coin) || cryptoCoins[0]
  const activeChain = chainOptions.find((item) => item.id === chainId) || chainOptions[0]
  const fxRate = oracleQuote?.fxQuote === currency && oracleQuote.fxRate > 0 ? oracleQuote.fxRate : fallbackFxRate(currency)
  const tokenRate = oracleQuote?.asset === activeChain.token && oracleQuote.priceUsd > 0 ? oracleQuote.priceUsd : activeCoin.usdRate
  const tokenAmount = Math.max(finalPrice / tokenRate, 0.000001)
  const lockRemainingMs = Math.max(0, lockExpiresAt - lockTick)
  const feeValue = oracleQuote?.estimatedFee && oracleQuote.estimatedFee !== 'unavailable'
    ? oracleQuote.estimatedFee
    : `本地估算 ${activeChain.feeLabel.toLowerCase()}`
  const feeLabel = oracleQuote?.feeLabel || activeChain.feeLabel

  useEffect(() => {
    const timer = window.setInterval(() => setLockTick(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const currentChain = chainOptions.find((item) => item.id === chainId)
    if (!currentChain || currentChain.token !== coin) {
      const next = chainOptions.find((item) => item.token === coin) || chainOptions[0]
      setChainId(next.id)
    }
  }, [coin, chainId])

  useEffect(() => {
    setIntent((prev) => refreshIntentPayload(prev, finalPrice, currency, paymentMethod, fxRate))
  }, [currency, finalPrice, paymentMethod, fxRate])

  useEffect(() => {
    const asset = activeChain.token
    setOracleQuote({
      asset,
      network: activeChain.id,
      feeLabel: activeChain.feeLabel,
      feeAsset: activeChain.gasUnit,
      estimatedFee: 'unavailable',
      priceUsd: activeCoin.usdRate,
      source: '本地演示汇率',
      updatedAt: new Date().toISOString(),
      fxBase: 'USD',
      fxQuote: currency,
      fxRate: fallbackFxRate(currency),
      status: 'preview',
    })
  }, [activeChain.id, activeChain.token, activeChain.gasUnit, activeChain.feeLabel, activeCoin.usdRate, currency])

  useEffect(() => {
    if (intent.status !== 'active') return
    if (lockExpiresAt <= Date.now()) {
      clearLockedOrder()
      return
    }
    saveLockedOrder(intent, lockExpiresAt)
  }, [intent, lockExpiresAt])

  useEffect(() => () => {
    if (authTimer.current) window.clearTimeout(authTimer.current)
  }, [])

  function goBack() {
    if (initial.returnTo) navigate(initial.returnTo)
    else navigate(-1)
  }

  function createNewLockedOrder() {
    const next = createPreviewIntent(finalPrice, currency, paymentMethod, fxRate, intent)
    const nextExpiresAt = Date.now() + ORDER_LOCK_MS
    setIntent(next)
    setLockExpiresAt(nextExpiresAt)
    setLockTick(Date.now())
    saveLockedOrder(next, nextExpiresAt)
    setReplaceDialogOpen(false)
    showToast('新订单已生成，订单锁定 60 分钟')
  }

  function refreshOrder() {
    if (intent.status === 'active' && lockExpiresAt > Date.now()) {
      setReplaceDialogOpen(true)
      return
    }
    createNewLockedOrder()
  }

  async function connectWallet() {
    setWalletStatus('正在连接钱包')
    const provider = walletProvider()
    if (!provider?.request) {
      setWalletStatus('未检测到浏览器钱包')
      showToast('未检测到浏览器钱包，请安装 MetaMask、OKX、Rabby 或 Coinbase Wallet', 'error')
      return
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const first = accounts?.[0] || ''
      setWalletAddress(first)
      setWalletStatus(first ? '已连接' : '未授权地址')
      showToast(first ? '钱包已连接' : '钱包未返回地址', first ? 'success' : 'error')
    } catch (error) {
      setWalletStatus('连接被拒绝')
      showToast(error instanceof Error ? error.message : '钱包连接失败', 'error')
    }
  }

  function beginExternalAuthorization(method: DigitalMethod) {
    const target = digitalMethods.find((item) => item.id === method)
    setDigitalMethod(method)
    if (!target?.official) return
    window.open(target.official, '_blank', 'noopener,noreferrer')
    setAuthDialog({ method, attempt: 1, manualRound: 0, status: 'connecting' })
    scheduleAuthorizationTick(method, 1, 0)
  }

  function scheduleAuthorizationTick(method: DigitalMethod, attempt: number, manualRound: number) {
    if (authTimer.current) window.clearTimeout(authTimer.current)
    authTimer.current = window.setTimeout(() => {
      if (attempt < 3) {
        setAuthDialog({ method, attempt: attempt + 1, manualRound, status: 'connecting' })
        scheduleAuthorizationTick(method, attempt + 1, manualRound)
      } else if (manualRound === 0) {
        setAuthDialog({ method, attempt: 3, manualRound, status: 'manual' })
      } else {
        setAuthDialog({ method, attempt: 3, manualRound, status: 'failed' })
      }
    }, 1200)
  }

  function retryAuthorization() {
    if (!authDialog) return
    setAuthDialog({ method: authDialog.method, attempt: 1, manualRound: authDialog.manualRound + 1, status: 'connecting' })
    scheduleAuthorizationTick(authDialog.method, 1, authDialog.manualRound + 1)
  }

  async function confirmPayment() {
    setLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 360))
    setIntent((prev) => ({ ...prev, status: 'paid' }))
    clearLockedOrder()
    setLockExpiresAt(0)
    setLoading(false)
    setSuccess(true)
    showToast('支付确认成功（演示）')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-semibold text-primary">支付已完成</h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            {checkoutKind === 'subscription'
              ? `${tier.name} 已开通，${tier.credit.toLocaleString()} Credit/月已写入账户。`
              : `${credit.toLocaleString()} Credit 已写入账户。`}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={() => navigate('/console/recharge')} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary">返回充值中心</button>
            <button onClick={() => navigate('/console')} className="rounded-xl border border-outline-variant px-5 py-3 text-sm font-semibold text-primary">进入控制台</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant/50 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button onClick={goBack} className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            返回
          </button>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="material-symbols-outlined text-[20px]">lock</span>
              支付货币
            </span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)} className="mn-select h-10 min-w-40 px-3 text-sm font-semibold text-primary">
              {currencies.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="order-2 space-y-5 lg:order-1">
          <div className="rounded-2xl border border-outline-variant bg-surface p-4 sm:p-5">
            <div className="mb-4 flex rounded-xl bg-surface-container-high p-1">
              <button onClick={() => setTab('web3')} className={`flex-1 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${tab === 'web3' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>Web3</button>
              <button onClick={() => setTab('cards')} className={`flex-1 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${tab === 'cards' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>银行卡</button>
              <button onClick={() => setTab('digital')} className={`flex-1 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${tab === 'digital' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>数字钱包</button>
            </div>

            {tab === 'web3' && (
              <Web3Panel
                coin={coin}
                chainId={chainId}
                activeChain={activeChain}
                tokenAmount={tokenAmount}
                feeLabel={feeLabel}
                feeValue={feeValue}
                feeSource={oracleQuote?.source || '本地演示'}
                feeUpdatedAt={oracleQuote?.updatedAt || ''}
                walletAddress={walletAddress}
                walletStatus={walletStatus}
                onCoinChange={setCoin}
                onChainChange={setChainId}
                onConnectWallet={connectWallet}
              />
            )}
            {tab === 'cards' && <CardPanel />}
            {tab === 'digital' && (
              <DigitalPanel
                method={digitalMethod}
                onSelect={beginExternalAuthorization}
              />
            )}
          </div>
        </section>

        <aside className="order-1 space-y-5 lg:sticky lg:top-24 lg:order-2">
          <section className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Order Amount</p>
                <p className="mt-2 text-4xl font-semibold tracking-normal text-primary">{displayMoney(finalPrice, currency, fxRate)}</p>
                {currency !== 'USD' && <p className="mt-1 text-sm font-semibold text-on-surface-variant">${finalPrice.toFixed(2)} USD</p>}
                <p className="mt-2 text-xs text-on-surface-variant">订单 ID: {intent.orderId}</p>
                {lockRemainingMs > 0 && (
                  <p className="mt-1 text-xs font-semibold text-primary">订单锁定剩余 {formatLockLeft(lockRemainingMs)}</p>
                )}
              </div>
              <button onClick={refreshOrder} className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-container-low">
                重新下单
              </button>
            </div>
            <div className="mt-5 rounded-xl bg-surface-container-low p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{checkoutKind === 'subscription' ? tier.name : 'API 额度充值'}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {checkoutKind === 'subscription'
                      ? `${tier.credit.toLocaleString()} Credit/${tier.period} · ${tier.note}`
                      : `${credit.toLocaleString()} Credit · 优先使用订阅额度，再使用 API 额度`}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">{displayMoney(baseAmount, currency, fxRate)}</span>
              </div>
              {checkoutKind === 'subscription' ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {tiers.map((item) => (
                    <button key={item.id} onClick={() => setSelectedTier(item.id)} className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${selectedTier === item.id ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:text-primary'}`}>
                      <span className="block font-semibold">{item.name}</span>
                      <span>{displayMoney(item.price, currency, fxRate)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <label className="mt-4 block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant">充值额度</span>
                  <input value={apiAmount} onChange={(event) => setApiAmount(Number(event.target.value))} type="number" min="1" className="h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm outline-none focus:ring-1 focus:ring-primary" />
                </label>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-primary">优惠券</h2>
              <span className="text-xs text-on-surface-variant">演示券</span>
            </div>
            <div className="space-y-2">
              <button onClick={() => setCouponId('')} className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${couponId === '' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>不使用优惠券</button>
              <button onClick={() => setCouponId('WELCOME10')} className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${couponId === 'WELCOME10' ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant hover:border-primary/40'}`}>
                <span className="block text-sm font-semibold">WELCOME10</span>
                <span className="text-xs text-on-surface-variant">10% 折扣 · 支付页演示优惠券</span>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant bg-surface p-5">
            <button onClick={() => setDetailsOpen((open) => !open)} className="flex w-full items-center justify-between text-left">
              <span className="text-sm font-semibold text-primary">账单明细</span>
              <span className="material-symbols-outlined text-[20px]">{detailsOpen ? 'expand_less' : 'expand_more'}</span>
            </button>
            {detailsOpen && (
              <div className="mt-4 space-y-1 text-sm">
                <BillRow label="原价" value={`$${baseAmount.toFixed(2)} USD`} />
                <BillRow label="优惠" value={`-$${discount.toFixed(2)} USD`} />
                {currency !== 'USD' && <BillRow label="汇率" value={`1 USD = ${fxRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${currency}`} />}
                <BillRow label="优惠券" value={selectedCoupon?.code || '未使用'} />
                <BillRow label="支付方式" value={paymentMethod.toUpperCase()} />
                <BillRow label="应付" value={displayMoney(finalPrice, currency, fxRate)} strong />
              </div>
            )}
          </section>

          <button
            disabled={loading}
            onClick={confirmPayment}
            className="w-full rounded-2xl bg-primary px-6 py-4 text-sm font-semibold text-on-primary shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '正在确认支付...' : `确认支付 ${displayMoney(finalPrice, currency, fxRate)}`}
          </button>
          <p className="px-2 text-center text-xs text-on-surface-variant">
            点击支付即表示同意我们的{' '}
            <a href="https://docs.modelnex.ai" target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
              支付协议
            </a>
          </p>
        </aside>
      </main>

      {authDialog && (
        <AuthorizationDialog
          dialog={authDialog}
          onClose={() => setAuthDialog(null)}
          onRetry={retryAuthorization}
        />
      )}
      {replaceDialogOpen && (
        <ReplaceOrderDialog
          orderId={intent.orderId}
          remaining={formatLockLeft(lockRemainingMs)}
          onCancel={() => setReplaceDialogOpen(false)}
          onConfirm={createNewLockedOrder}
        />
      )}
    </div>
  )
}

function Web3Panel({ coin, chainId, activeChain, tokenAmount, feeLabel, feeValue, feeSource, feeUpdatedAt, walletAddress, walletStatus, onCoinChange, onChainChange, onConnectWallet }: {
  coin: 'BTC' | 'ETH' | 'SOL'
  chainId: string
  activeChain: ChainOption
  tokenAmount: number
  feeLabel: string
  feeValue: string
  feeSource: string
  feeUpdatedAt: string
  walletAddress: string
  walletStatus: string
  onCoinChange: (coin: 'BTC' | 'ETH' | 'SOL') => void
  onChainChange: (chain: string) => void
  onConnectWallet: () => void
}) {
  const availableChains = chainOptions.filter((item) => item.token === coin)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {cryptoCoins.map((item) => (
          <button key={item.id} onClick={() => onCoinChange(item.id)} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${coin === item.id ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant hover:border-primary/50'}`}>
            <img src={item.asset} alt={item.name} className="h-10 w-10 rounded-full object-contain" />
            <span className="text-xs font-bold">{item.id}</span>
          </button>
        ))}
      </div>
      <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant">网络</span>
            <select value={chainId} onChange={(event) => onChainChange(event.target.value)} className="mn-select w-full rounded-lg border-outline-variant bg-surface-container-low text-sm">
              {availableChains.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">应发送</span>
              <span className="text-sm text-on-surface-variant">{activeChain.token}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-primary">{tokenAmount.toFixed(activeChain.token === 'BTC' ? 6 : 4)} {activeChain.token}</p>
          </div>
          <InfoBox label={feeLabel} value={feeValue} live />
          <div className="rounded-lg border border-outline-variant bg-surface px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">Source</p>
            <p className="mt-1 text-xs text-on-surface-variant">{feeSource}{feeUpdatedAt ? ` · ${new Date(feeUpdatedAt).toLocaleTimeString()}` : ''}</p>
          </div>
          <InfoBox label="状态" value={walletStatus} />
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant">收款地址</span>
            <div className="flex gap-2">
              <input readOnly value={activeChain.address} className="h-11 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface px-3 font-mono text-xs outline-none" />
              <button onClick={() => { void navigator.clipboard?.writeText(activeChain.address); showToast('地址已复制') }} className="h-11 rounded-lg border border-outline-variant px-3 text-primary hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
          </div>
          {walletAddress && (
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3 text-xs text-on-surface-variant">
              已连接：<span className="font-mono text-primary">{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</span>
            </div>
          )}
          <button onClick={onConnectWallet} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary">
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            连接钱包
          </button>
      </div>
    </div>
  )
}

function CardPanel() {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">支持的卡组织与支付网络</p>
        <div className="flex flex-wrap gap-2">
          {cardBrands.map((item) => (
            <span key={item} className="flex h-9 w-16 items-center justify-center rounded-lg border border-outline-variant bg-white px-2">
              <img src={`/payment-assets/card-orgs/${item}`} alt={item.replace('.png', '')} className="max-h-6 max-w-full object-contain" />
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <PaymentInput label="持卡人姓名" placeholder="ZHANG SAN" />
        <PaymentInput label="手机号码" placeholder="+86 138 0000 0000" />
        <PaymentInput label="卡号" placeholder="0000 0000 0000 0000" span />
        <PaymentInput label="有效期" placeholder="MM / YY" />
        <PaymentInput label="CVV" placeholder="123" type="password" />
        <PaymentInput label="国家/地区" placeholder="China / United States" />
        <PaymentInput label="州/省" placeholder="California / Shanghai" />
        <PaymentInput label="城市" placeholder="Shanghai / Los Angeles" />
        <PaymentInput label="账单地址" placeholder="街道、楼层、门牌号" span />
        <PaymentInput label="发卡行" placeholder="Bank name" />
        <PaymentInput label="支行信息" placeholder="Branch name" />
        <PaymentInput label="邮编" placeholder="100000" />
      </div>
    </div>
  )
}

function DigitalPanel({ method, onSelect }: {
  method: DigitalMethod
  onSelect: (method: DigitalMethod) => void
}) {
  const selected = digitalMethods.find((item) => item.id === method) || digitalMethods[0]
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {digitalMethods.map((item) => (
          <button key={item.id} onClick={() => onSelect(item.id)} className={`flex min-h-20 items-center justify-center gap-3 rounded-xl border p-3 transition-colors ${method === item.id ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant hover:border-primary/50'}`}>
            <img src={item.asset} alt={item.label} className="max-h-8 max-w-[5rem] rounded object-contain" />
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
      {selected.qr ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-sm font-semibold text-primary">使用 {selected.label} 扫码支付</p>
          <div className="rounded-xl border border-outline-variant bg-white p-3 shadow-sm">
            <img src={selected.qr} alt={`${selected.label} QR`} className="h-44 w-44 object-contain" />
          </div>
          <p className="text-xs text-on-surface-variant">二维码为当前订单测试收款码，支付完成后点击右侧确认。</p>
        </div>
      ) : (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5 text-sm text-on-surface-variant">
          已打开 {selected.label} 官方授权页面。本页会自动尝试连接订单状态。
        </div>
      )}
    </div>
  )
}

function AuthorizationDialog({ dialog, onClose, onRetry }: {
  dialog: { method: DigitalMethod; attempt: number; manualRound: number; status: 'connecting' | 'manual' | 'failed' }
  onClose: () => void
  onRetry: () => void
}) {
  const method = digitalMethods.find((item) => item.id === dialog.method)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-primary">{method?.label || '外部支付'} 订单连接</p>
            <p className="mt-1 text-xs text-on-surface-variant">订单状态最多自动查看 3 次。</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="mt-5 rounded-xl bg-surface-container-low p-4">
          {dialog.status === 'connecting' && (
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
              <div>
                <p className="text-sm font-semibold text-on-surface">正在连接订单</p>
                <p className="mt-1 text-xs text-on-surface-variant">正在查看订单信息，第 {dialog.attempt} / 3 次</p>
              </div>
            </div>
          )}
          {dialog.status === 'manual' && (
            <div>
              <p className="text-sm font-semibold text-on-surface">当前链接失败，请手动连接。</p>
              <button onClick={onRetry} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">手动连接</button>
            </div>
          )}
          {dialog.status === 'failed' && (
            <div>
              <p className="text-sm font-semibold text-red-700">订单失败，请联系管理员或稍后重试。</p>
              <button onClick={onClose} className="mt-3 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-primary">知道了</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReplaceOrderDialog({ orderId, remaining, onCancel, onConfirm }: {
  orderId: string
  remaining: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary">receipt_long</span>
          <div>
            <p className="text-base font-semibold text-primary">还有一笔订单未支付</p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              当前订单 {orderId} 仍在锁定中，剩余 {remaining}。确定消除上面订单重新支付吗？
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low">
            取消
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

function PaymentInput({ label, placeholder, type = 'text', span = false }: { label: string; placeholder: string; type?: string; span?: boolean }) {
  return (
    <label className={span ? 'block sm:col-span-2' : 'block'}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
      <input type={type} className="h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder={placeholder} />
    </label>
  )
}

function InfoBox({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${live ? 'text-primary tabular-nums' : 'text-on-surface'}`}>{value}</p>
    </div>
  )
}

function BillRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 py-2 last:border-b-0">
      <span className="text-on-surface-variant">{label}</span>
      <span className={strong ? 'text-lg font-semibold text-primary' : 'font-semibold text-on-surface'}>{value}</span>
    </div>
  )
}
