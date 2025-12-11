import axios from 'axios'

// Nếu bạn chạy backend ở port 8082, hãy đảm bảo baseURL đúng (có thể cần http://localhost:8082 nếu chưa cấu hình proxy)
// Tạm thời để nguyên logic cũ của bạn là '/api/auth'
const API_BASE_URL = 'http://localhost:8082/api/auth' 

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// === CẬP NHẬT INTERCEPTOR ===
// Tự động thêm token vào header cho mọi request dùng apiClient
apiClient.interceptors.request.use(
  (config) => {
    // Sửa logic lấy token: Lấy từ object 'user' thay vì key 'token' trần
    const userStr = localStorage.getItem('user')
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        // Kiểm tra cả 2 trường hợp tên biến token phổ biến
        const token = user.token || user.accessToken
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (e) {
        console.error("Lỗi parse JSON user trong interceptor", e)
      }
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
      // Backend của bạn dùng 'username' hay 'usernameOrEmail'? 
      // Kiểm tra lại AuthController. Nếu là 'username', hãy sửa key bên dưới cho khớp.
      username: username, 
      password
    })
    
    // === QUAN TRỌNG: LƯU TOKEN VÀO LOCAL STORAGE ===
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    
    return response.data
  },

  // Thêm hàm Logout để xóa token
  logout: () => {
    localStorage.removeItem('user')
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