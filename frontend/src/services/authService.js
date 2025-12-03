import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api/auth'

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (usernameOrEmail, password) => {
    const response = await apiClient.post('/login', {
      usernameOrEmail,
      password
    })
    return response.data
  },

  register: async (userData) => {
    const response = await apiClient.post('/register', userData)
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    const response = await apiClient.post('/reset-password', {
      token,
      newPassword,
      confirmPassword
    })
    return response.data
  }
}



