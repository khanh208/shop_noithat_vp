import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/orders'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor 1: Tự động chèn Token vào header
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

// Interceptor 2: Tự động xử lý lỗi 401 (Hết hạn token)
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

export const orderService = {
  createOrder: async (orderData) => {
    // Truyền params đúng cách
    const response = await apiClient.post('/create', null, {
      params: orderData
    })
    return response.data
  },

  getUserOrders: async (page = 0, size = 10) => {
    const response = await apiClient.get('', {
      params: { page, size }
    })
    return response.data
  },

  getOrderByCode: async (orderCode) => {
    const response = await apiClient.get(`/${orderCode}`)
    return response.data
  }
}