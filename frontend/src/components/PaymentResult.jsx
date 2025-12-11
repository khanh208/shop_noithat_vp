import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navigation from './Navigation'
import axios from 'axios' // Đảm bảo đã import axios

const PaymentResult = () => {
  const [searchParams] = useSearchParams()
  // Lấy các tham số trả về từ MoMo
  const resultCode = searchParams.get('resultCode')
  const message = searchParams.get('message')
  const orderId = searchParams.get('orderId') // MoMo trả về orderId (VD: TOPUP-1-...)
  
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    if (resultCode === '0') {
      setStatus('success')
      // [FIX] Gọi API check lại trạng thái để đảm bảo tiền đã cộng (phòng trường hợp Ngrok lỗi)
      // Bạn có thể implement thêm API check transaction status ở backend nếu cần
    } else {
      setStatus('failed')
    }
  }, [resultCode])

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container mt-5 pt-5">
        <div className="card shadow p-5 text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {status === 'success' ? (
            <>
              <div className="mb-4 text-success">
                <i className="fas fa-check-circle fa-5x"></i>
              </div>
              <h2 className="text-success">Giao dịch thành công!</h2>
              <p className="lead">Yêu cầu nạp tiền đã được xử lý.</p>
              
              {/* Hiển thị thông báo khác nhau tùy loại giao dịch */}
              {orderId && orderId.includes('TOPUP') ? (
                 <p className="text-muted">Số dư ví của bạn sẽ được cập nhật trong giây lát.</p>
              ) : (
                 <p className="text-muted">Cảm ơn bạn đã mua hàng.</p>
              )}

              <div className="d-flex justify-content-center gap-3 mt-4">
                {orderId && orderId.includes('TOPUP') ? (
                    <Link to="/wallet" className="btn btn-primary">
                        <i className="fas fa-wallet me-2"></i>Kiểm tra ví ngay
                    </Link>
                ) : (
                    <Link to="/orders" className="btn btn-primary">
                        Xem đơn hàng
                    </Link>
                )}
                
                <Link to="/home" className="btn btn-outline-secondary">
                  Về trang chủ
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 text-danger">
                <i className="fas fa-times-circle fa-5x"></i>
              </div>
              <h2 className="text-danger">Giao dịch thất bại</h2>
              <p className="text-muted">{message || 'Đã có lỗi xảy ra trong quá trình thanh toán.'}</p>
              <Link to="/wallet" className="btn btn-warning mt-3">
                Thử lại
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentResult