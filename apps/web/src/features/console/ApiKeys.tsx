import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useConsoleStore } from './store'
import { showToast } from '../../lib/toast'
import ConsoleIcon from './ConsoleIcon'
import type { ApiKey } from './types'

const ALL_MODELS = '全部模型'
const NO_LIMIT = '不限'
const MODEL_ALIASES = [
  'modelnex-local-alpha',
  'modelnex-local-coder',
  'modelnex-local-markdown',
  'modelnex-local-logic',
  'modelnex-local-fast',
]

type ModelGroup = {
  id: string
  name: string
  provider: string
}

const SHOWCASE_GROUPS: ModelGroup[] = [
  { id: 'general', name: '通用模型', provider: 'Smart Dolphin' },
  { id: 'analytics', name: '分析模型', provider: 'Smart Dolphin' },
  { id: 'sandbox', name: '沙盒模型', provider: 'Smart Dolphin' },
]

type KeyForm = {
  name: string
  group: string
  days: string
  amount: string
  expiresAt: string
}

export default function ApiKeys() {
  const { apiKeys, addApiKey, updateApiKey, deleteApiKey, toggleApiKeyStatus } = useConsoleStore()
  const [groups, setGroups] = useState<ModelGroup[]>(SHOWCASE_GROUPS)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedKey, setGeneratedKey] = useState('')
  const [dialog, setDialog] = useState<null | { mode: 'create' | 'edit'; id?: string }>(null)
  const [form, setForm] = useState<KeyForm>({
    name: '',
    group: '',
    days: '',
    amount: '',
    expiresAt: '',
  })

  const apiBaseUrl = `${window.location.origin}/v1`
  const modelGroups = useMemo(() => groups.map((item) => item.id), [groups])

  async function copyText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const input = document.createElement('textarea')
      input.value = text
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopiedId(id)
    showToast('已复制')
    window.setTimeout(() => setCopiedId(null), 1400)
  }

  function openCreate() {
    setForm({ name: '', group: groups[0]?.id || '', days: '', amount: '', expiresAt: '' })
    setDialog({ mode: 'create' })
  }

  function openEdit(id: string) {
    const key = apiKeys.find((item) => item.id === id)
    if (!key) return
    setForm({
      name: key.name,
      group: key.group || groups[0]?.id || '',
      days: key.limitPeriod?.match(/\d+/)?.[0] || '',
      amount: key.limitAmount ? String(key.limitAmount) : '',
      expiresAt: key.expiresAt || '',
    })
    setDialog({ mode: 'edit', id })
  }

  async function submitDialog() {
    if (!form.name.trim()) {
      showToast('请输入密钥名称', 'error')
      return
    }
    if (!form.group) {
      showToast('暂无可用模型分组，请先在后台配置分组', 'error')
      return
    }
    const payload = {
      name: form.name.trim(),
      group: form.group,
      status: 'active' as const,
      limitAmount: form.amount ? Number(form.amount) : undefined,
      limitPeriod: form.days ? `${form.days} 天` : undefined,
      expiresAt: form.expiresAt || undefined,
    }

    if (dialog?.mode === 'edit' && dialog.id) {
      const ok = await updateApiKey(dialog.id, payload)
      showToast(ok ? 'API 密钥已更改' : 'API 密钥更改失败', ok ? 'success' : 'error')
      if (ok) setDialog(null)
      return
    }

    const created = await addApiKey(payload)
    if (!created) {
      showToast('API 密钥创建失败', 'error')
      return
    }
    setGeneratedKey(created)
    setDialog(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-medium text-primary">API 密钥</h2>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
            创建和管理 API 密钥。当前是静态演示，操作只在本次浏览中生效。
          </p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90">
          <ConsoleIcon name="add" className="h-4 w-4" />
          创建密钥
        </button>
      </div>

      <div className="rounded-lg border border-outline-variant bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Base URL</span>
          <button onClick={() => void copyText(apiBaseUrl, 'base')} className="text-primary hover:underline">
            OpenAI <code className="font-mono">{apiBaseUrl}</code>
          </button>
          <button onClick={() => void copyText(`${apiBaseUrl}/chat/completions`, 'chat')} className="text-primary hover:underline">
            Chat <code className="font-mono">/chat/completions</code>
          </button>
          <span className="text-xs text-on-surface-variant">使用 Authorization: Bearer sk-...</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-outline-variant/50 pt-3 text-xs">
          <span className="font-semibold text-on-surface-variant">模型名</span>
          {MODEL_ALIASES.map((model) => (
            <button key={model} onClick={() => void copyText(model, `model-${model}`)} className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 font-mono text-primary hover:bg-primary/10">
              {model}
              <ConsoleIcon name={copiedId === `model-${model}` ? 'check' : 'copy'} className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {['名称', '密钥', '分组', '用量', '状态', '创建时间', '过期时间', '最后使用', '操作'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiKeys.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-on-surface-variant">暂无 API 密钥。</td>
                </tr>
              )}
              {apiKeys.map((key) => (
                <tr key={key.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <td className="px-4 py-3 text-sm font-medium text-on-surface">{key.name}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => void copyText(key.key, key.id)} className="inline-flex max-w-[240px] items-center gap-2 text-left font-mono text-xs text-on-surface-variant hover:text-primary">
                      <span className="truncate">{key.key}</span>
                      <ConsoleIcon name={copiedId === key.id ? 'check' : 'copy'} className="h-4 w-4 shrink-0" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{groupLabel(key.group || '', groups)}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant"><UsageCell apiKey={key} /></td>
                  <td className="px-4 py-3"><StatusBadge status={key.status} /></td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{formatTableDate(key.created)}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{formatExpiry(key.expiresAt)}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{formatTableDate(key.lastUsed)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <TextAction label={key.status === 'active' ? '禁用' : '启用'} onClick={() => void toggleApiKeyStatus(key.id).then((ok) => showToast(ok ? '状态已更新' : '状态更新失败', ok ? 'success' : 'error'))} />
                      <TextAction label="更改" onClick={() => openEdit(key.id)} />
                      <TextAction label="删除" danger onClick={() => void deleteApiKey(key.id).then((ok) => showToast(ok ? 'API 密钥已删除' : 'API 密钥删除失败', ok ? 'success' : 'error'))} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {dialog && (
        <KeyDialog
          mode={dialog.mode}
          form={form}
          setForm={setForm}
          modelGroups={modelGroups}
          groups={groups}
          onClose={() => setDialog(null)}
          onSubmit={() => void submitDialog()}
        />
      )}

      {generatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGeneratedKey('')}>
          <div className="w-full max-w-lg rounded-lg border border-outline-variant bg-surface p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-medium text-primary">API 密钥已创建</h3>
            <p className="mt-2 text-sm text-on-surface-variant">完整密钥只显示一次，请现在复制。</p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <code className="min-w-0 flex-1 break-all text-xs">{generatedKey}</code>
              <button onClick={() => void copyText(generatedKey, 'generated')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-on-primary">
                <ConsoleIcon name={copiedId === 'generated' ? 'check' : 'copy'} className="h-4 w-4" />
                {copiedId === 'generated' ? '已复制' : '复制'}
              </button>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setGeneratedKey('')} className="rounded-lg border border-outline-variant px-5 py-2 text-sm">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UsageCell({ apiKey }: { apiKey: ApiKey }) {
  const requests = Number(apiKey.requests || 0)
  const tokens = Number(apiKey.tokens || 0)
  const used = Number(apiKey.limitUsed || 0)
  const limit = Number(apiKey.limitAmount || 0)
  const cost = Number(apiKey.cost || 0)

  return (
    <div className="min-w-[150px] space-y-1">
      <div>{requests.toLocaleString()} 次请求</div>
      <div>{tokens.toLocaleString()} tokens</div>
      <div>{limit > 0 ? `${used.toLocaleString()} / ${limit.toLocaleString()} 额度` : '不限额度'}</div>
      {cost > 0 && <div>${cost.toFixed(4)}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: ApiKey['status'] }) {
  const classes = status === 'active'
    ? 'bg-green-100 text-green-700'
    : status === 'limited'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700'
  const label = status === 'active' ? '启用' : status === 'limited' ? '受限' : '停用'
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>{label}</span>
}

function formatTableDate(value?: string) {
  if (!value || value === '-') return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function formatExpiry(value?: string) {
  if (!value || value === '-') return '不过期'
  return formatTableDate(value)
}

function TextAction({ label, danger, onClick }: { label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${danger ? 'text-red-600 hover:bg-red-50' : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'}`}
    >
      {label}
    </button>
  )
}

function KeyDialog(props: {
  mode: 'create' | 'edit'
  form: KeyForm
  setForm: (value: KeyForm) => void
  modelGroups: string[]
  groups: ModelGroup[]
  onClose: () => void
  onSubmit: () => void
}) {
  const { form, setForm } = props
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={props.onClose}>
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface p-6" onClick={(event) => event.stopPropagation()}>
        <h3 className="mb-4 text-lg font-medium text-primary">{props.mode === 'create' ? '创建 API 密钥' : '更改 API 密钥'}</h3>
        <div className="space-y-4">
          <Field label="名称">
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mn-input w-full" placeholder="生产环境密钥" />
          </Field>
          <Field label="模型分组">
            <select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })} className="mn-select w-full">
              {props.modelGroups.length === 0 && <option value="">暂无可用分组</option>}
              {props.modelGroups.map((group) => <option key={group} value={group}>{groupLabel(group, props.groups)}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="有效天数">
              <input value={form.days} onChange={(event) => setForm({ ...form, days: event.target.value })} type="number" min="1" className="mn-input w-full" placeholder="30" />
            </Field>
            <Field label="数量">
              <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} type="number" min="0" className="mn-input w-full" placeholder="10000" />
            </Field>
          </div>
          <Field label="过期时间">
            <input value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} type="date" className="mn-input w-full" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={props.onClose} className="rounded-lg px-4 py-2 text-sm text-on-surface-variant hover:text-primary">取消</button>
          <button onClick={props.onSubmit} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary hover:bg-primary/90">
            {props.mode === 'create' ? '创建' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{label}</span>
      {children}
    </label>
  )
}

function groupLabel(group: string, groups: ModelGroup[]) {
  if (!group) return '-'
  if (group === ALL_MODELS) return group
  const found = groups.find((item) => item.id === group)
  return found ? `${found.name} (${found.provider})` : group
}
