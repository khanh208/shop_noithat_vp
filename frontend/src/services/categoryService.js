import axios from 'axios'

// SỬA: Đổi thành đường dẫn tương đối, bỏ http://localhost:8082
const API_BASE_URL = '/api/categories'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm Interceptor giống productService để chắc chắn
apiClient.interceptors.request.use(
  (config) => {
    // Nếu sau này cần token cho API category thì nó sẽ tự động có
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const categoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get('')
    return response.data
  }
}