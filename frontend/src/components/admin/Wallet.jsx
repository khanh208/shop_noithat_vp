import React, { useState, useEffect } from 'react'
import Navigation from './Navigation'
import { useAuth } from '../context/AuthContext'
import walletService from '../services/walletService'
import { userService } from '../services/userService'

const Wallet = () => {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [depositAmount, setDepositAmount] = useState(50000)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([]) // Nếu muốn hiển thị lịch sử

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    try {
      // 1. Lấy thông tin số dư mới nhất
      const updatedUser = await userService.getProfile()
      setBalance(updatedUser.balance || 0)
      
      // 2. Nếu có API lấy lịch sử giao dịch thì gọi ở đây (Optional)
      // const history = await walletService.getTransactions()
      // setTransactions(history)
    } catch (error) {
      console.error("Lỗi tải thông tin ví:", error)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000 VNĐ")
      return
    }

    setLoading(true)
    try {
      // Gọi API nạp tiền (Momo Sandbox)
      const response = await walletService.depositMoMo(depositAmount, user.id)
      
      if (response && response.payUrl) {
        // Chuyển hướng người dùng sang trang thanh toán MoMo
        window.location.href = response.payUrl
      } else {
        alert("Không nhận được link thanh toán từ hệ thống.")
      }
    } catch (error) {
      console.error("Lỗi nạp tiền:", error)
      alert("Có lỗi xảy ra khi tạo giao dịch nạp tiền.")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-0 rounded-lg">
              <div className="card-header bg-primary text-white text-center py-4">
                <h3 className="mb-0"><i className="fas fa-wallet me-2"></i>Ví Cá Nhân</h3>
              </div>
              
              <div className="card-body p-5">
                {/* Phần hiển thị số dư */}
                <div className="text-center mb-5">
                  <h5 className="text-muted text-uppercase small ls-1">Số dư hiện tại</h5>
                  <h1 className="display-4 fw-bold text-success mb-0">
                    {formatPrice(balance)}
                  </h1>
                </div>

                <hr className="my-4" />

                {/* Form nạp tiền */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Nạp thêm tiền vào ví</label>
                  <div className="input-group input-group-lg mb-3">
                    <span className="input-group-text bg-white border-end-0">₫</span>
                    <input 
                      type="number" 
                      className="form-control border-start-0 ps-0"
                      placeholder="Nhập số tiền (VD: 100000)"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="10000"
                      step="10000"
                    />
                  </div>
                  <div className="form-text text-muted mb-3">
                    <i className="fas fa-info-circle me-1"></i>
                    Số tiền nạp tối thiểu là 10.000đ. Thanh toán qua cổng MoMo (Test).
                  </div>
                </div>

                <button 
                  className="btn btn-danger btn-lg w-100 py-3 fw-bold shadow-sm hover-scale"
                  onClick={handleDeposit}
                  disabled={loading}
                  style={{ transition: 'all 0.3s' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang kết nối MoMo...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-qrcode me-2"></i>NẠP NGAY QUA MOMO
                    </>
                  )}
                </button>
              </div>
              
              <div className="card-footer bg-light text-center py-3">
                <small className="text-muted">
                  An toàn - Bảo mật - Nhanh chóng
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet