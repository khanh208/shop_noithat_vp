import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      setSuccess(true)
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">
            <i className="fas fa-envelope-open-text me-2"></i>
            Email đã được gửi
          </h2>
          
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            <strong>Thành công!</strong>
            <p className="mb-0 mt-2">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <strong>{email}</strong>.
              Vui lòng kiểm tra hộp thư (kể cả thư mục spam).
            </p>
          </div>

          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <small>
              <strong>Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ.
            </small>
          </div>

          <Link to="/login" className="btn btn-primary w-100">
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          <i className="fas fa-unlock-alt me-2"></i>
          Quên mật khẩu
        </h2>

        <p className="text-muted mb-4">
          Nhập địa chỉ email của bạn. Chúng tôi sẽ gửi link để đặt lại mật khẩu.
        </p>

        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-envelope me-2"></i>
              Địa chỉ Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email đã đăng ký"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang gửi...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Gửi email đặt lại mật khẩu
              </>
            )}
          </button>

          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none">
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword