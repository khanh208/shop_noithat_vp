import axios from 'axios'
import authHeader from './authHeader'

const API_URL = 'http://localhost:8082/api/payment/'

const walletService = {
  // Nạp tiền qua MoMo
  depositMoMo: async (amount, userId) => {
    // Lưu ý: Backend cần nhận param dạng form-data hoặc query param tùy cách bạn viết controller
    // Ở controller bạn dùng @RequestParam nên ta gửi query params
    const response = await axios.post(
      API_URL + `deposit-momo?amount=${amount}&userId=${userId}`,
      {},
      { headers: authHeader() }
    )
    return response.data
  }
}

export default walletService