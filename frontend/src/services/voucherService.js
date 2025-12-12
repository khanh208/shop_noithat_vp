import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/vouchers'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm token nếu cần (tuỳ voucher có yêu cầu đăng nhập không, thường là có)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

export const voucherService = {
  checkVoucher: async (code, total) => {
    // Gọi API: GET /api/vouchers/check?code=XYZ&total=100000
    const response = await apiClient.get(`/check`, {
      params: { code, total }
    })
    return response.data
  }
}