import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/cart'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor 1: Tự động chèn Token
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

// Interceptor 2: Tự động xử lý lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized. Please login again.')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get('')
    return response.data
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await apiClient.post(`/add?productId=${productId}&quantity=${quantity}`)
    return response.data
  },

  updateQuantity: async (cartItemId, quantity) => {
    const response = await apiClient.put(`/${cartItemId}?quantity=${quantity}`)
    return response.data
  },

  removeFromCart: async (cartItemId) => {
    const response = await apiClient.delete(`/${cartItemId}`)
    return response.data
  },

  getTotal: async () => {
    const response = await apiClient.get('/total')
    return response.data
  }
}