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
  
  // State cho lịch sử giao dịch
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadWalletData()
  }, [page]) // Reload khi đổi trang

  const loadWalletData = async () => {
    try {
      // 1. Load số dư
      const updatedUser = await userService.getProfile() 
      setBalance(updatedUser.balance || 0)

      // 2. Load lịch sử giao dịch
      const history = await walletService.getTransactions(page, 5) // Lấy 5 dòng mỗi trang
      setTransactions(history.content || [])
      setTotalPages(history.totalPages || 0)
    } catch (error) {
      console.error("Lỗi tải dữ liệu ví", error)
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
        window.location.href = response.payUrl
      }
    } catch (error) {
      alert("Lỗi tạo giao dịch nạp tiền: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  
  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN')

  // Helper hiển thị loại giao dịch đẹp hơn
  const getTransactionType = (type) => {
      const map = {
          'DEPOSIT': { text: 'Nạp tiền', color: 'success', icon: 'fa-arrow-down' },
          'PAYMENT': { text: 'Thanh toán', color: 'danger', icon: 'fa-arrow-up' },
          'REFUND': { text: 'Hoàn tiền', color: 'primary', icon: 'fa-undo' }
      }
      return map[type] || { text: type, color: 'secondary', icon: 'fa-circle' }
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-5">
        <div className="row">
            {/* CỘT TRÁI: THÔNG TIN VÍ & NẠP TIỀN */}
            <div className="col-md-5 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-wallet me-2"></i>Ví của tôi</h5>
                  </div>
                  <div className="card-body text-center p-4">
                    <h6 className="text-muted text-uppercase">Số dư khả dụng</h6>
                    <h1 className="text-success fw-bold display-5 mb-4">{formatPrice(balance)}</h1>
                    
                    <div className="bg-light p-3 rounded border mb-3">
                        <label className="form-label fw-bold">Nạp thêm tiền (MoMo)</label>
                        <div className="input-group mb-3">
                        <span className="input-group-text">₫</span>
                        <input 
                            type="number" 
                            className="form-control"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            min="10000"
                            step="10000"
                        />
                        </div>
                        <button 
                        className="btn btn-danger w-100 fw-bold" 
                        onClick={handleDeposit}
                        disabled={loading}
                        >
                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</> : 'Nạp ngay'}
                        </button>
                    </div>
                    <small className="text-muted">* Tối thiểu 10.000đ</small>
                  </div>
                </div>
            </div>

            {/* CỘT PHẢI: LỊCH SỬ GIAO DỊCH */}
            <div className="col-md-7">
                <div className="card shadow-sm h-100">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0"><i className="fas fa-history me-2"></i>Lịch sử giao dịch</h5>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => loadWalletData()}>
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    <div className="card-body p-0">
                        {transactions.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                Chưa có giao dịch nào.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Loại</th>
                                            <th>Số tiền</th>
                                            <th>Chi tiết</th>
                                            <th className="text-end">Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(tx => {
                                            const typeInfo = getTransactionType(tx.type)
                                            // Kiểm tra nếu là DEPOSIT hoặc REFUND thì tiền dương (+), PAYMENT thì âm (-)
                                            const isPositive = tx.type === 'DEPOSIT' || tx.type === 'REFUND'
                                            
                                            return (
                                                <tr key={tx.id}>
                                                    <td>
                                                        <span className={`badge bg-${typeInfo.color} bg-opacity-10 text-${typeInfo.color} border border-${typeInfo.color}`}>
                                                            <i className={`fas ${typeInfo.icon} me-1`}></i>{typeInfo.text}
                                                        </span>
                                                    </td>
                                                    <td className={`fw-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                                                        {isPositive ? '+' : ''}{formatPrice(tx.amount)}
                                                    </td>
                                                    <td>
                                                        <div className="small text-truncate" style={{maxWidth: '200px'}} title={tx.description}>
                                                            {tx.description}
                                                        </div>
                                                        {tx.orderCode && <small className="text-muted d-block">Mã đơn: {tx.orderCode}</small>}
                                                    </td>
                                                    <td className="text-end small text-muted">
                                                        {formatDate(tx.createdAt)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    {/* Phân trang đơn giản */}
                    {totalPages > 1 && (
                        <div className="card-footer bg-white py-2">
                            <ul className="pagination justify-content-center mb-0 pagination-sm">
                                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(page - 1)}>Trước</button>
                                </li>
                                <li className="page-item disabled">
                                    <span className="page-link text-dark">Trang {page + 1}/{totalPages}</span>
                                </li>
                                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(page + 1)}>Sau</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet