import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Token không hợp lệ. Vui lòng kiểm tra lại link trong email.')
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token: token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })

      setSuccess(true)
      
      // Chuyển về login sau 3 giây
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      setError(error.response?.data?.message || 'Đặt lại mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">
            <i className="fas fa-key me-2"></i>
            Đặt lại mật khẩu
          </h2>
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            Token không hợp lệ hoặc đã hết hạn.
          </div>
          <Link to="/login" className="btn btn-primary w-100">
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">
            <i className="fas fa-check-circle text-success me-2"></i>
            Thành công!
          </h2>
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            Mật khẩu đã được đặt lại thành công!
            <p className="mt-3 mb-0">Đang chuyển hướng đến trang đăng nhập...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          <i className="fas fa-key me-2"></i>
          Đặt lại mật khẩu
        </h2>

        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              <i className="fas fa-lock me-2"></i>
              Mật khẩu mới <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              required
              minLength={6}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              <i className="fas fa-lock me-2"></i>
              Xác nhận mật khẩu <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
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
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Đặt lại mật khẩu
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

export default ResetPassword