import axios from 'axios'
import authHeader from './authHeader'

const API_URL = 'http://localhost:8082/api/users/'

const userService = {
  // Lấy thông tin cá nhân (bao gồm số dư ví)
  getProfile: async () => {
    const response = await axios.get(API_URL + 'profile', { headers: authHeader() })
    return response.data
  },

  // Cập nhật thông tin (nếu cần sau này)
  updateProfile: async (userData) => {
    const response = await axios.put(API_URL + 'profile', userData, { headers: authHeader() })
    return response.data
  }
}

export { userService }