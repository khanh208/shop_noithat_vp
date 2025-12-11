import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/auth'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// === SỬA LỖI: Interceptor lấy token ĐÚNG CÁCH ===
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token trực tiếp từ localStorage (không phải object 'user')
    const token = localStorage.getItem('token')
    
    if (token && token !== 'undefined' && token !== 'null') {
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
      usernameOrEmail,  // ✅ Sửa lại tên field cho đúng
      password
    })
    
    // === SỬA LỖI: LƯU TOKEN ĐÚNG CÁCH ===
    if (response.data && response.data.token) {
      // Lưu token riêng (để dùng cho Authorization header)
      localStorage.setItem('token', response.data.token)
      
      // Lưu thêm thông tin user (tùy chọn, để hiển thị UI)
      const userInfo = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      }
      localStorage.setItem('user', JSON.stringify(userInfo))
    }
    
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  register: async (userData) => {
    const response = await apiClient.post('/register', userData)
    
    // === SỬA LỖI: LƯU TOKEN SAU KHI ĐĂNG KÝ ===
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)
      const userInfo = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      }
      localStorage.setItem('user', JSON.stringify(userInfo))
    }
    
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