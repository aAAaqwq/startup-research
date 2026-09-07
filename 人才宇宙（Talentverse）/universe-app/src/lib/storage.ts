// 持久化：localStorage schema 版本化（client-localstorage-schema）
// 只在惰性初始化与"存储镜像"里读写；运行中交互全部走 React state。

const PREFIX = 'tv.uni.v1'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function load<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(PREFIX + ':' + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(PREFIX + ':' + key, JSON.stringify(value))
  } catch {
    /* 忽略配额等写入失败 */
  }
}

export function clearAll(): void {
  if (!isBrowser()) return
  try {
    const keys: string[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i)
      if (k != null && k.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach((k) => window.localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}
