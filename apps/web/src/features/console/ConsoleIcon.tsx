import type { CSSProperties } from 'react'

type ConsoleIconProps = {
  name: string
  className?: string
  style?: CSSProperties
}

const PATHS: Record<string, string> = {
  dashboard: 'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z',
  vpn_key: 'M7 14a4 4 0 1 1 3.46-6H21v3h-3v3h-3v3h-3.54A4 4 0 0 1 7 14Zm0-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  bar_chart: 'M5 21V9h3v12H5Zm5 0V3h3v18h-3Zm5 0v-7h3v7h-3Z',
  payments: 'M3 6h18v12H3V6Zm2 3v6h14V9H5Zm2 4h5v2H7v-2Z',
  confirmation_number: 'M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5Zm5 3v2h6V8H9Zm0 4v2h6v-2H9Z',
  receipt_long: 'M6 2h12v20l-3-2-3 2-3-2-3 2V2Zm3 5h6V5H9v2Zm0 4h6V9H9v2Zm0 4h4v-2H9v2Z',
  group_add: 'M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0 2c-3.31 0-6 1.79-6 4v2h9.2A6.47 6.47 0 0 1 11 18c0-1.5.5-2.88 1.35-4H8Zm10-1v3h3v3h-3v3h-3v-3h-3v-3h3v-3h3Zm-2-1a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z',
  menu: 'M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z',
  search: 'M10 4a6 6 0 1 1-3.78 10.66L3.7 17.18 2.3 15.77l2.52-2.52A6 6 0 0 1 10 4Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  notifications: 'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v2H5v-2l2-2v-4a5 5 0 0 1 10 0v4l2 2Z',
  query_stats: 'M4 19h16v2H4v-2Zm2-2a4 4 0 0 1 4-4c.73 0 1.41.2 2 .54L16.54 9H14V7h6v6h-2v-2.54l-4.63 4.63A4 4 0 1 1 6 17Zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  stacked_line_chart: 'M3 17.5 8 12l4 4 7-9 2 1.5-8.8 11.3-4.1-4.1L4.5 19 3 17.5Zm0-6L8 6l4 4 7-7 2 1.5-9 9-4-4-3.5 3.5L3 11.5Z',
  speed: 'M12 4a9 9 0 0 1 9 9c0 2.1-.72 4.03-1.93 5.56l-1.54-1.28A6.96 6.96 0 0 0 19 13a7 7 0 1 0-14 0c0 1.63.56 3.14 1.5 4.33l-1.54 1.28A9 9 0 0 1 12 4Zm4.24 5.76-3.53 4.95a2 2 0 1 1-1.62-1.17l3.53-4.95 1.62 1.17Z',
  error: 'M11 7h2v7h-2V7Zm0 9h2v2h-2v-2Zm1-14 10 18H2L12 2Z',
  monitoring: 'M3 17h18v2H3v-2Zm2-2 4-5 4 3 5-7 2 1.5-6.7 9.4-4-3L6.6 17 5 15Z',
  play_arrow: 'M8 5v14l11-7L8 5Z',
  code: 'M8.7 16.3 4.4 12l4.3-4.3L7.3 6.3 1.6 12l5.7 5.7 1.4-1.4Zm6.6 0 4.3-4.3-4.3-4.3 1.4-1.4 5.7 5.7-5.7 5.7-1.4-1.4ZM13 4l-3.8 16h2.1L15.1 4H13Z',
  copy: 'M8 8h11v13H8V8Zm-3 8H3V3h13v2H5v11Z',
  check: 'M9.2 16.6 4.9 12.3 3.5 13.7l5.7 5.7L21 7.6 19.6 6.2 9.2 16.6Z',
  add: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z',
  delete: 'M6 7h12v14H6V7Zm2-4h8l1 2h4v2H3V5h4l1-2Z',
  edit: 'M4 17.5V21h3.5L18.1 10.4l-3.5-3.5L4 17.5ZM20.7 7.8a1 1 0 0 0 0-1.4l-3.1-3.1a1 1 0 0 0-1.4 0l-1.3 1.3 4.5 4.5 1.3-1.3Z',
}

export default function ConsoleIcon({ name, className = '', style }: ConsoleIconProps) {
  const path = PATHS[name] || PATHS.monitoring

  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      focusable="false"
      style={style}
    >
      <path d={path} />
    </svg>
  )
}
