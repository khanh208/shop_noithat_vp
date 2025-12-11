import axios from 'axios'

const API_URL = 'http://localhost:8082/api/users/'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: Tự động lấy token từ LocalStorage chèn vào Header
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

// Interceptor: Xử lý lỗi 401 (Hết hạn token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Nếu token hết hạn, tự động đăng xuất
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const userService = {
  getProfile: async () => {
    // Gọi API lấy thông tin user (bao gồm số dư ví)
    const response = await apiClient.get('profile')
    return response.data
  },
  
  updateProfile: async (userData) => {
    const response = await apiClient.put('profile', userData)
    return response.data
  }
}

export { userService } 
export default userService