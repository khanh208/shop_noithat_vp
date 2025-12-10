import React, { useState, useEffect } from 'react'
import Navigation from './Navigation'
import { useAuth } from '../context/AuthContext'
import walletService from '../services/walletService'
import { userService } from '../services/userService' // Cần có service lấy thông tin user mới nhất

const Wallet = () => {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [depositAmount, setDepositAmount] = useState(50000)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBalance()
  }, [])

  const loadBalance = async () => {
    try {
      // Gọi API lấy thông tin user mới nhất để cập nhật số dư
      // Giả sử có API: userService.getProfile()
      const updatedUser = await userService.getProfile() 
      setBalance(updatedUser.balance || 0)
    } catch (error) {
      console.error("Lỗi tải số dư", error)
    }
  }

  const handleDeposit = async () => {
    if (depositAmount < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000đ")
      return
    }
    
    setLoading(true)
    try {
      const response = await walletService.depositMoMo(depositAmount, user.id)
      if (response && response.payUrl) {
        window.location.href = response.payUrl // Chuyển sang MoMo
      }
    } catch (error) {
      alert("Lỗi tạo giao dịch nạp tiền")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-5">
        <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0"><i className="fas fa-wallet me-2"></i>Ví của tôi</h4>
          </div>
          <div className="card-body text-center p-5">
            <h5 className="text-muted">Số dư hiện tại</h5>
            <h1 className="text-success fw-bold display-4 mb-4">{formatPrice(balance)}</h1>
            
            <hr />
            
            <h5 className="mb-3">Nạp tiền vào ví</h5>
            <div className="input-group mb-3">
              <span className="input-group-text">VNĐ</span>
              <input 
                type="number" 
                className="form-control form-control-lg"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="10000"
                step="10000"
              />
            </div>
            
            <button 
              className="btn btn-danger btn-lg w-100" 
              onClick={handleDeposit}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Nạp ngay qua MoMo'}
            </button>
            <small className="text-muted d-block mt-2">
              * Môi trường MoMo Sandbox (Test)
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet