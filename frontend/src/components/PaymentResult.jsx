import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navigation from './Navigation'

const PaymentResult = () => {
  const [searchParams] = useSearchParams()
  const resultCode = searchParams.get('resultCode')
  const message = searchParams.get('message')
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    if (resultCode === '0') {
      setStatus('success')
      // TODO: Ở bước này, đúng ra phải gọi API Backend để xác nhận lại (IPN)
      // Nhưng tạm thời hiển thị thành công dựa trên URL redirect
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
              <h2 className="text-success">Thanh toán thành công!</h2>
              <p className="lead">Cảm ơn bạn đã mua hàng.</p>
              <p className="text-muted">{message}</p>
              <Link to="/orders" className="btn btn-primary mt-3">
                Xem đơn hàng của tôi
              </Link>
            </>
          ) : (
            <>
              <div className="mb-4 text-danger">
                <i className="fas fa-times-circle fa-5x"></i>
              </div>
              <h2 className="text-danger">Thanh toán thất bại</h2>
              <p className="text-muted">{message}</p>
              <Link to="/checkout" className="btn btn-warning mt-3">
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