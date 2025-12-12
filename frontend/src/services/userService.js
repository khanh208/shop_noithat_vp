import axios from 'axios'

const API_URL = 'http://localhost:8082/api/users/'
const UPLOAD_URL = 'http://localhost:8082/api/upload/image' // API upload ảnh

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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

const userService = {
  getProfile: async () => {
    const response = await apiClient.get('profile')
    return response.data
  },
  
  updateProfile: async (userData) => {
    const response = await apiClient.put('profile', userData)
    return response.data
  },

  // === THÊM HÀM NÀY ===
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Gọi API upload riêng (không qua apiClient để tránh override Content-Type)
    const response = await axios.post(UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Nếu API upload cần bảo mật, bỏ comment dòng dưới:
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` 
      }
    })
    return response.data // Trả về { url: "..." }
  }
}

export { userService } 
export default userService