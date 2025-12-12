import React, { useState } from 'react'
import { Link } from 'react-router-dom' // Bỏ useNavigate vì dùng window.location
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  
  // Không cần useNavigate nữa vì chúng ta sẽ reload trang thủ công

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
    setLoading(true)

    if (!formData.usernameOrEmail || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin')
      setLoading(false)
      return
    }

    const result = await login(formData.usernameOrEmail, formData.password)
    
    if (result.success) {
      // === QUAN TRỌNG: Dùng window.location.href để chuyển trang ===
      // Việc này buộc trình duyệt tải lại trang (Refresh), giúp reset biến 
      // 'hasShownPopupThisSession' ở trang Home => Banner sẽ hiện ra.
      window.location.href = '/home'
    } else {
      setError(result.message || 'Đăng nhập thất bại')
    }
    
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          <i className="fas fa-sign-in-alt me-2"></i>
          Đăng Nhập
        </h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="usernameOrEmail" className="form-label">
              <i className="fas fa-user me-2"></i>
              Tên đăng nhập hoặc Email
            </label>
            <input
              type="text"
              className="form-control"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Nhập username hoặc email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <i className="fas fa-lock me-2"></i>
              Mật khẩu
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div className="mb-3 text-end">
            <Link to="/forgot-password" class="text-decoration-none">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>
                Đăng Nhập
              </>
            )}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted">Chưa có tài khoản? </span>
            <Link to="/register" className="text-decoration-none fw-bold">
              Đăng ký ngay
            </Link>
          </div>

          <div className="mt-4">
            <div className="text-center text-muted mb-3">
              <small>Hoặc đăng nhập bằng</small>
            </div>
            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => window.location.href = 'http://localhost:8082/oauth2/authorization/google'}
              >
                <i className="fab fa-google me-2"></i>
                Đăng nhập với Google
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => window.location.href = 'http://localhost:8082/oauth2/authorization/facebook'}
              >
                <i className="fab fa-facebook me-2"></i>
                Đăng nhập với Facebook
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 p-3 bg-light rounded">
          <small className="text-muted">
            <strong>Tài khoản test:</strong><br />
            Admin: <code>admin</code> / <code>admin123</code><br />
            Customer: <code>customer</code> / <code>customer123</code>
          </small>
        </div>
      </div>
    </div>
  )
}

export default Login