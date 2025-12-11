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
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.error('No valid token found. Redirecting to login...')
      window.location.href = '/login'
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor xử lý lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized. Please login again.')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const adminService = {
  // =================================================================
  // THỐNG KÊ & BÁO CÁO (ANALYTICS)
  // =================================================================

  // 1. Thống kê cơ bản (Số lượng sản phẩm, đơn hàng, user...) - Không lọc ngày
  getDashboardStats: async () => {
    const response = await apiClient.get('/dashboard/stats')
    return response.data
  },

  // 2. Tổng quan doanh thu, đơn hàng (Card hiển thị) - Có thể mở rộng lọc ngày nếu Backend hỗ trợ
  getDashboardOverview: async () => {
    const response = await apiClient.get('/analytics/overview')
    return response.data
  },

  // 3. Top sản phẩm bán chạy (Có lọc theo ngày)
  getTopSellingProducts: async (limit = 5, startDate, endDate) => {
    const params = { limit }
    if (startDate) params.startDate = startDate.toISOString()
    if (endDate) params.endDate = endDate.toISOString()
    
    const response = await apiClient.get('/analytics/top-selling-products', { params })
    return response.data
  },

  // 4. Thống kê trạng thái đơn hàng (Hiện tại)
  getOrdersByStatus: async () => {
    const response = await apiClient.get('/analytics/orders-by-status')
    return response.data
  },

  // 5. Doanh thu theo danh mục (Có lọc theo ngày)
  getRevenueByCategory: async (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate.toISOString()
    if (endDate) params.endDate = endDate.toISOString()

    const response = await apiClient.get('/analytics/revenue-by-category', { params })
    return response.data
  },

  // 6. Doanh thu theo thời gian (Biểu đồ)
  getRevenueByTime: async (startDate, endDate, groupBy = 'day') => {
    const params = { groupBy }
    if (startDate) params.startDate = startDate.toISOString()
    if (endDate) params.endDate = endDate.toISOString()

    const response = await apiClient.get('/analytics/revenue-by-time', { params })
    return response.data
  },

  // 7. Xuất báo cáo Excel
  exportReport: async (reportType, startDate, endDate) => {
    try {
      const response = await apiClient.get('/analytics/export-report', {
        params: { 
          reportType,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        },
        responseType: 'blob' // Quan trọng: nhận file binary
      })
      return response.data
    } catch (error) {
      console.error('Error exporting report:', error)
      throw error
    }
  },

  // =================================================================
  // QUẢN LÝ SẢN PHẨM (PRODUCT)
  // =================================================================
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

  // =================================================================
  // QUẢN LÝ ĐƠN HÀNG (ORDER)
  // =================================================================
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

  // =================================================================
  // QUẢN LÝ NGƯỜI DÙNG (USER)
  // =================================================================
  getAllUsers: async (page = 0, size = 20) => {
    const response = await apiClient.get('/users', {
      params: { page, size }
    })
    return response.data
  },

  // =================================================================
  // QUẢN LÝ DANH MỤC (CATEGORY)
  // =================================================================
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
  }
}