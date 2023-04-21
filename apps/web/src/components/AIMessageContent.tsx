import { Fragment, useEffect, useMemo, useState } from 'react'
import { codeToHtml } from 'shiki'

type SupportedAILang = 'zh' | 'zh-TW' | 'en' | 'de' | 'nl' | 'ja' | 'es'

function uiPhrase(lang: SupportedAILang, key: 'copied' | 'runUnsupported' | 'runBlocked') {
  if (lang === 'en') return { copied: 'Copied', runUnsupported: 'Only safe basic Python output is available.', runBlocked: 'This code cannot run in the showcase.' }[key]
  if (lang === 'de') return { copied: 'Kopiert', runUnsupported: 'Nur eine sichere einfache Python-Ausgabe ist verfügbar.', runBlocked: 'Dieser Code kann in der Demo nicht ausgeführt werden.' }[key]
  if (lang === 'nl') return { copied: 'Gekopieerd', runUnsupported: 'Alleen veilige eenvoudige Python-uitvoer is beschikbaar.', runBlocked: 'Deze code kan niet in de demo worden uitgevoerd.' }[key]
  if (lang === 'zh-TW') return { copied: '已複製', runUnsupported: '目前僅支援安全的基礎 Python 輸出。', runBlocked: '此程式碼無法在展示模式中執行。' }[key]
  return { copied: '已复制', runUnsupported: '当前仅支持安全的基础 Python 输出。', runBlocked: '此代码不能在展示模式中运行。' }[key]
}

interface CodeBlock {
  type: 'code'
  lang: string
  code: string
}

interface TextBlock {
  type: 'text'
  text: string
}

type Block = CodeBlock | TextBlock

interface AIMessageContentProps {
  content: string
  lang: SupportedAILang
  compact?: boolean
}

const runnablePythonPattern = /^\s*(print\([^]*?\)|[\w\s=+\-*/().,'":\[\]{}]+)\s*$/m
const blockedRuntimePattern = /\b(import|from|open\(|requests\.|http|socket|subprocess|os\.|sys\.|eval\(|exec\(|__import__|read\(|write\(|delete|remove|unlink)\b/i

export default function AIMessageContent({ content, lang, compact = false }: AIMessageContentProps) {
  const blocks = useMemo(() => parseBlocks(content), [content])
  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        block.type === 'code'
          ? <AICodeBlock key={index} block={block} lang={lang} compact={compact} />
          : <MarkdownText key={index} text={block.text} />
      ))}
    </div>
  )
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  const pattern = /```([A-Za-z0-9_+#.-]*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(content))) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', text: content.slice(lastIndex, match.index).trimEnd() })
    }
    blocks.push({ type: 'code', lang: normalizeCodeLang(match[1]), code: match[2].trimEnd() })
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < content.length) blocks.push({ type: 'text', text: content.slice(lastIndex).trim() })
  return blocks.filter((block) => block.type === 'code' || block.text)
}

function normalizeCodeLang(value: string) {
  const lang = value.trim().toLowerCase()
  if (lang === 'ts') return 'typescript'
  if (lang === 'js') return 'javascript'
  if (lang === 'py') return 'python'
  if (lang === 'rs') return 'rust'
  if (lang === 'md') return 'markdown'
  return lang || 'text'
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n')
  const nodes = []
  for (let index = 0; index < lines.length;) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    const table = readTable(lines, index)
    if (table) {
      nodes.push(<MarkdownTable key={index} rows={table.rows} />)
      index = table.nextIndex
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      nodes.push(<div key={index} className={`ai-md-heading ai-md-heading-${level}`}>{renderInline(heading[2])}</div>)
      index += 1
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''))
        index += 1
      }
      nodes.push(<ul key={index} className="ai-md-list">{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ul>)
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ''))
        index += 1
      }
      nodes.push(<ol key={index} className="ai-md-list ai-md-ordered">{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ol>)
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote = []
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }
      nodes.push(<blockquote key={index} className="ai-md-quote">{quote.map((item, itemIndex) => <Fragment key={itemIndex}>{renderInline(item)}{itemIndex < quote.length - 1 ? <br /> : null}</Fragment>)}</blockquote>)
      continue
    }

    const paragraph = [line]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !readTable(lines, index)
    ) {
      paragraph.push(lines[index])
      index += 1
    }
    nodes.push(<p key={index} className="ai-md-paragraph">{renderInline(paragraph.join(' '))}</p>)
  }
  return <div className="ai-markdown">{nodes}</div>
}

function readTable(lines: string[], start: number): { rows: string[][]; nextIndex: number } | null {
  if (start + 1 >= lines.length) return null
  if (!lines[start].includes('|') || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[start + 1])) return null
  const rows = [splitTableRow(lines[start])]
  let index = start + 2
  while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
    rows.push(splitTableRow(lines[index]))
    index += 1
  }
  return { rows, nextIndex: index }
}

function splitTableRow(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="ai-md-inline-code">{part.slice(1, -1)}</code>
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    return <Fragment key={index}>{part}</Fragment>
  })
}

function MarkdownTable({ rows }: { rows: string[][] }) {
  const [head, ...body] = rows
  return (
    <div className="ai-md-table-wrap">
      <table className="ai-md-table">
        <thead>
          <tr>{head.map((cell, index) => <th key={index}>{renderInline(cell)}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{renderInline(cell)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AICodeBlock({ block, lang, compact }: { block: CodeBlock; lang: SupportedAILang; compact: boolean }) {
  const [status, setStatus] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [highlighted, setHighlighted] = useState('')
  const langLabel = displayLang(block.lang)

  useEffect(() => {
    let active = true
    codeToHtml(block.code, { lang: shikiLang(block.lang), theme: 'dark-plus' })
      .then((html) => {
        if (active) setHighlighted(html)
      })
      .catch(() => {
        if (active) setHighlighted('')
      })
    return () => { active = false }
  }, [block.code, block.lang])

  const copy = async () => {
    await navigator.clipboard?.writeText(block.code)
    setStatus(uiPhrase(lang, 'copied'))
  }

  const run = () => {
    if (block.lang !== 'python') {
      setStatus(uiPhrase(lang, 'runUnsupported'))
      return
    }
    if (blockedRuntimePattern.test(block.code) || !runnablePythonPattern.test(block.code)) {
      setStatus(uiPhrase(lang, 'runBlocked'))
      return
    }
    const printMatch = block.code.match(/print\((['"`])([\s\S]*?)\1\)/)
    setStatus(printMatch ? `stdout: ${printMatch[2]}` : 'stdout: ok')
  }

  const shell = (
    <div className={`ai-code-block ${expanded ? 'ai-code-expanded' : ''}`}>
      <div className="ai-code-header">
        <div className="ai-code-lang">{langLabel}</div>
        <div className="ai-code-actions">
          <button onClick={copy} title="复制"><span className="material-symbols-outlined">content_copy</span>{compact ? null : '复制'}</button>
          <button onClick={run} title="运行"><span className="material-symbols-outlined">play_circle</span>{compact ? null : '运行'}</button>
          <button onClick={() => setExpanded(!expanded)} title="放大"><span className="material-symbols-outlined">{expanded ? 'close_fullscreen' : 'open_in_full'}</span></button>
        </div>
      </div>
      {highlighted ? (
        <div className="ai-code-body ai-code-body-shiki" dangerouslySetInnerHTML={{ __html: highlighted }} />
      ) : (
        <pre className="ai-code-body"><code>{block.code}</code></pre>
      )}
      {status && <div className="ai-code-status">{status}</div>}
    </div>
  )

  if (!expanded) return shell
  return (
    <div className="ai-code-modal" role="dialog" aria-modal="true">
      {shell}
    </div>
  )
}

function shikiLang(lang: string) {
  if (lang === 'text') return 'txt'
  if (lang === 'shell') return 'bash'
  return lang
}

function displayLang(lang: string) {
  const map: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    markdown: 'Markdown',
    rust: 'Rust',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    text: 'Text',
  }
  return map[lang] || lang.toUpperCase()
}
