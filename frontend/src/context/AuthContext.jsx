import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra token trong localStorage khi component mount
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      // Có thể decode token để lấy thông tin user
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]))
        setUser({
          username: payload.sub,
          role: payload.role
        })
      } catch (e) {
        console.error('Error decoding token:', e)
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await authService.login(usernameOrEmail, password)
      setToken(response.token)
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      })
      localStorage.setItem('token', response.token)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        // Dùng optional chaining (?.) để tránh crash
        message: error.response?.data?.message || error.message || 'Đăng nhập thất bại' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      setToken(response.token)
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      })
      localStorage.setItem('token', response.token)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Đăng ký thất bại' 
      }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}




