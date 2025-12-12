import axios from 'axios'

const API_BASE_URL = '/api/reviews'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

export const reviewService = {
  createReview: async (reviewData) => {
    const response = await apiClient.post('', reviewData)
    return response.data
  },
  
  // --- THÊM MỚI ---
  updateReview: async (reviewId, reviewData) => {
    const response = await apiClient.put(`/${reviewId}`, reviewData)
    return response.data
  },

  getMyReview: async (orderId, productId) => {
    try {
        const response = await apiClient.get(`/check`, {
            params: { orderId, productId }
        })
        return response.data // Trả về object review hoặc "" nếu 204 No Content
    } catch (error) {
        return null
    }
  },
  getProductReviews: async (productId, page = 0, size = 10) => {
    const response = await apiClient.get(`/product/${productId}`, {
      params: { page, size }
    })
    return response.data
  }
}