// File: frontend/src/services/bannerService.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/banners'

export const bannerService = {
  getPopupBanner: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/popup`)
      return response.data
    } catch (error) {
      return null; // Không có banner hoặc lỗi
    }
  }
}