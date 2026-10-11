export function getMonday(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatWeekRange(monday) {
  const friday = addDays(monday, 4)
  const opts = { month: 'short', day: 'numeric' }
  return `${monday.toLocaleDateString('en-US', opts)} – ${friday.toLocaleDateString('en-US', opts)}, ${friday.getFullYear()}`
}

export function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getTodayIndex() {
  const day = new Date().getDay()
  return day >= 1 && day <= 5 ? day - 1 : 4
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}