import axios from 'axios'

// Cấu hình URL API: Đảm bảo port backend là 8082
const API_BASE_URL = 'http://localhost:8082/api/admin'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm interceptor để tự động thêm token vào header mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    // FIX: Kiểm tra token hợp lệ trước khi gửi
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // Nếu không có token hợp lệ, chuyển về trang login
      console.error('No valid token found. Redirecting to login...')
      window.location.href = '/login'
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// FIX: Thêm interceptor để xử lý lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      console.error('Unauthorized. Please login again.')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const adminService = {
  // --- Dashboard ---
  getDashboardStats: async () => {
    const response = await apiClient.get('/dashboard/stats')
    return response.data
  },

  // --- Products (Sản phẩm) ---
  getAllProducts: async (page = 0, size = 20) => {
    const response = await apiClient.get('/products', {
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

  // --- Orders (Đơn hàng) ---
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

  // --- Users (Người dùng) ---
  getAllUsers: async (page = 0, size = 20) => {
    const response = await apiClient.get('/users', {
      params: { page, size }
    })
    return response.data
  },

  // --- Categories (Danh mục) ---
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories')
      const data = response.data
      if (Array.isArray(data)) {
        return data
      } else {
        console.error('Categories response is not an array:', data)
        return []
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  getCategoryById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/categories', categoryData)
    return response.data
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}`, categoryData)
    return response.data
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`)
    return response.data
  },
  exportReport: async (reportType, startDate, endDate) => {
    try {
      const response = await apiClient.get('/analytics/export-report', {
        params: { 
          reportType,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        },
        responseType: 'blob' // QUAN TRỌNG: Để nhận file binary
      })
      return response.data
    } catch (error) {
      console.error('Error exporting report:', error)
      throw error
    }
  }

}