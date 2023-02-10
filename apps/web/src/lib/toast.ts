type ToastType = 'success' | 'error' | 'info'

export function showToast(message: string, type: ToastType = 'success') {
  if (typeof document === 'undefined') return
  let root = document.getElementById('mn-toast-root')
  if (!root) {
    root = document.createElement('div')
    root.id = 'mn-toast-root'
    root.className = 'mn-toast-root'
    document.body.appendChild(root)
  }
  const item = document.createElement('div')
  item.className = `mn-toast mn-toast-${type}`
  item.textContent = message
  root.appendChild(item)
  window.setTimeout(() => item.classList.add('mn-toast-visible'), 16)
  window.setTimeout(() => {
    item.classList.remove('mn-toast-visible')
    window.setTimeout(() => item.remove(), 220)
  }, 2600)
}
