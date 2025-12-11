import axios from 'axios'
import authHeader from './authHeader'

const API_URL = 'http://localhost:8082/api/users/'

const userService = {
  getProfile: async () => {
    try {
      const response = await axios.get(API_URL + 'profile', { headers: authHeader() })
      return response.data
    } catch (error) {
      console.error("Error fetching profile:", error)
      throw error
    }
  },
  
  updateProfile: async (userData) => {
    const response = await axios.put(API_URL + 'profile', userData, { headers: authHeader() })
    return response.data
  }
}

// Xuất ra cả 2 kiểu để tránh lỗi import bên Wallet.jsx
export { userService } 
export default userService