import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const token = searchParams.get('code')
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('Thiếu mã xác thực. Vui lòng kiểm tra lại link trong email.')
    }
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      const response = await axios.get(`/api/auth/verify?code=${token}`)
      setStatus('success')
      setMessage(response.data.message || 'Email đã được xác thực thành công!')
      
      // Tự động chuyển về trang login sau 3 giây
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Xác thực thất bại. Token có thể đã hết hạn.')
    }
  }

  const handleResendEmail = async () => {
    const email = prompt('Nhập email của bạn để gửi lại mã xác thực:')
    if (!email) return

    setResending(true)
    try {
      await axios.post(`/api/auth/resend-verification?email=${email}`)
      alert('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.')
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể gửi lại email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          <i className="fas fa-envelope-open-text me-2"></i>
          Xác thực Email
        </h2>

        {status === 'verifying' && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Đang xác thực email của bạn...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            {message}
            <p className="mt-3 mb-0">Đang chuyển hướng đến trang đăng nhập...</p>
          </div>
        )}

        {status === 'error' && (
          <>
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>
              {message}
            </div>
            
            <div className="d-grid gap-2 mt-3">
              <button 
                className="btn btn-primary" 
                onClick={handleResendEmail}
                disabled={resending}
              >
                {resending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
              </button>
              
              <Link to="/login" className="btn btn-outline-secondary">
                Về trang đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail