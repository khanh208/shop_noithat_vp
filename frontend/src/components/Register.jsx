import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

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
    setSuccess(false)
    setLoading(true)

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.fullName || !formData.phoneNumber) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber || null
    })
    
    if (result.success) {
      setSuccess(true)
      // Không tự động chuyển trang nữa, hiển thị thông báo để user check email
    } else {
      setError(result.message || 'Đăng ký thất bại')
    }
    
    setLoading(false)
  }

  // === THÊM UI HIỂN THỊ KHI ĐĂNG KÝ THÀNH CÔNG ===
  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">
            <i className="fas fa-check-circle text-success me-2"></i>
            Đăng ký thành công!
          </h2>
          
          <div className="alert alert-success">
            <i className="fas fa-envelope me-2"></i>
            <strong>Kiểm tra email của bạn!</strong>
            <p className="mb-0 mt-2">
              Chúng tôi đã gửi email xác thực đến <strong>{formData.email}</strong>.
              Vui lòng nhấn vào link trong email để kích hoạt tài khoản.
            </p>
          </div>

          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <small>
              <strong>Lưu ý:</strong> Kiểm tra cả thư mục spam nếu không thấy email.
            </small>
          </div>

          <Link to="/login" className="btn btn-primary w-100">
            <i className="fas fa-arrow-left me-2"></i>
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          <i className="fas fa-user-plus me-2"></i>
          Đăng Ký
        </h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              <i className="fas fa-user me-2"></i>
              Tên đăng nhập <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              required
              minLength={3}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-envelope me-2"></i>
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="fullName" className="form-label">
              <i className="fas fa-id-card me-2"></i>
              Họ và tên <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="phoneNumber" className="form-label">
              <i className="fas fa-phone me-2"></i>
              Số điện thoại <span className="text-danger">*</span> {}
            </label>
            <input
              type="tel"
              className="form-control"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              required 
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <i className="fas fa-lock me-2"></i>
              Mật khẩu <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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
              placeholder="Nhập lại mật khẩu"
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
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang đăng ký...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus me-2"></i>
                Đăng Ký
              </>
            )}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted">Đã có tài khoản? </span>
            <Link to="/login" className="text-decoration-none fw-bold">
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register