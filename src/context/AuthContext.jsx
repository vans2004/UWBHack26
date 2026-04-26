import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function loadUsers() {
  try { return JSON.parse(localStorage.getItem('spos_users') || '[]') } catch { return [] }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    () => localStorage.getItem('spos_currentUser') || null
  )

  const login = (username, password) => {
    const users = loadUsers()
    const match = users.find(u => u.username === username && u.password === password)
    if (!match) return 'Invalid username or password'
    localStorage.setItem('spos_currentUser', username)
    setCurrentUser(username)
    return null
  }

  const signup = (username, password) => {
    const name = username.trim()
    if (!name || !password) return 'Please fill in all fields'
    if (name.length < 2) return 'Username must be at least 2 characters'
    const users = loadUsers()
    if (users.find(u => u.username === name)) return 'Username already taken'
    users.push({ username: name, password })
    localStorage.setItem('spos_users', JSON.stringify(users))
    localStorage.setItem('spos_currentUser', name)
    setCurrentUser(name)
    return null
  }

  const logout = () => {
    localStorage.removeItem('spos_currentUser')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
