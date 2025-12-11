import axios from 'axios'

// Sửa Base URL thành /api để có thể gọi cả /payment và /wallet
const API_BASE_URL = 'http://localhost:8082/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: Tự động chèn Token
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

// Interceptor: Xử lý lỗi 401
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

const walletService = {
  // Nạp tiền qua MoMo (Lưu ý: đã thêm /payment vào đường dẫn)
  depositMoMo: async (amount, userId) => {
    const response = await apiClient.post(
      `/payment/deposit-momo?amount=${amount}&userId=${userId}`
    )
    return response.data
  },

  // Thêm hàm thanh toán đơn hàng bằng ví
  payOrder: async (orderId) => {
    const response = await apiClient.post(
      `/wallet/pay-order/${orderId}`
    )
    return response.data
  }
}

export default walletService