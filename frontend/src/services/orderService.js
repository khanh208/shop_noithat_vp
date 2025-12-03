import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/orders'

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

export const orderService = {
  createOrder: async (orderData) => {
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




