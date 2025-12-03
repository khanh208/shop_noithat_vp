import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api/products'

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

export const productService = {
  getAllProducts: async (page = 0, size = 12, sortBy = 'createdAt', sortDir = 'DESC') => {
    const response = await apiClient.get('', {
      params: { page, size, sortBy, sortDir }
    })
    return response.data
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/${id}`)
    return response.data
  },

  getProductBySlug: async (slug) => {
    const response = await apiClient.get(`/slug/${slug}`)
    return response.data
  },

  getFeaturedProducts: async (page = 0, size = 12) => {
    const response = await apiClient.get('/featured', {
      params: { page, size }
    })
    return response.data
  },

  getBestSellingProducts: async (page = 0, size = 12) => {
    const response = await apiClient.get('/best-selling', {
      params: { page, size }
    })
    return response.data
  },

  getDiscountedProducts: async (page = 0, size = 12) => {
    const response = await apiClient.get('/discounted', {
      params: { page, size }
    })
    return response.data
  },

  searchProducts: async (filters = {}, page = 0, size = 12) => {
    const response = await apiClient.get('/search', {
      params: { ...filters, page, size }
    })
    return response.data
  }
}

