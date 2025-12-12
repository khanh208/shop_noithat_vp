import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/wishlist'

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

export const wishlistService = {
  getWishlist: async (page = 0, size = 10) => {
    const response = await apiClient.get('', { params: { page, size } })
    return response.data
  },
  toggleWishlist: async (productId) => {
    const response = await apiClient.post(`/toggle/${productId}`)
    return response.data
  },
  checkWishlist: async (productId) => {
    const response = await apiClient.get(`/check/${productId}`)
    return response.data
  }
}