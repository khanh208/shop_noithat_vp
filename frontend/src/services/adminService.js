import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/admin'

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

export const adminService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/dashboard/stats')
    return response.data
  },

  getAllProducts: async (page = 0, size = 20) => {
    const response = await apiClient.get('/products', {
      params: { page, size }
    })
    return response.data
  },

  getAllOrders: async (page = 0, size = 20) => {
    const response = await apiClient.get('/orders', {
      params: { page, size }
    })
    return response.data
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await apiClient.put(`/orders/${orderId}/status`, null, {
      params: { status }
    })
    return response.data
  },

  getAllUsers: async (page = 0, size = 20) => {
    const response = await apiClient.get('/users', {
      params: { page, size }
    })
    return response.data
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData)
    return response.data
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData)
    return response.data
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories')
      // Đảm bảo trả về array
      const data = response.data
      if (Array.isArray(data)) {
        return data
      } else {
        console.error('Categories response is not an array:', data)
        return []
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }
}

