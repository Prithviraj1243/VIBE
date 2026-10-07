const KEY = 'flowx-user'

export function saveUser(user) {
  sessionStorage.setItem(KEY, JSON.stringify(user))
}

export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

export function clearUser() {
  sessionStorage.removeItem(KEY)
}
