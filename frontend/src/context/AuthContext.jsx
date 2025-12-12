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
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken) {
        setToken(storedToken)
        
        // SỬA LỖI: Ưu tiên lấy User từ localStorage trước (vì có chứa ID)
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
          } catch (e) {
            console.error("Lỗi parse user từ localStorage", e)
            // Nếu lỗi parse, fallback về decode token (dù thiếu ID nhưng vẫn đỡ hơn null)
            decodeToken(storedToken)
          }
        } else {
          // Nếu không có storedUser, mới decode token
          decodeToken(storedToken)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  // Hàm phụ trợ để decode token
  const decodeToken = (tokenStr) => {
    try {
      const payload = JSON.parse(atob(tokenStr.split('.')[1]))
      setUser({
        username: payload.sub,
        role: payload.role
        // Lưu ý: Token hiện tại không có ID, nên nếu vào case này ID vẫn sẽ thiếu.
        // Nhưng logic chính đã được fix bằng cách lấy từ localStorage ở trên.
      })
    } catch (e) {
      console.error('Error decoding token:', e)
      localStorage.removeItem('token')
    }
  }

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await authService.login(usernameOrEmail, password)
      
      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      }

      setToken(response.token)
      setUser(userData)
      
      // Lưu vào localStorage để persistence
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Đăng nhập thất bại' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      
      const userInfo = {
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      }

      setToken(response.token)
      setUser(userInfo)
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(userInfo))
      
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
    localStorage.removeItem('user')
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