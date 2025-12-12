import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

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

    // Giả lập độ trễ 1 chút để người dùng thấy hiệu ứng loading (tùy chọn)
    await new Promise(resolve => setTimeout(resolve, 800))

    const result = await login(formData.usernameOrEmail, formData.password)
    
    if (result.success) {
      // Dùng window.location.href để refresh trang, giúp reset các biến toàn cục (như popup banner)
      window.location.href = '/home'
    } else {
      setError(result.message || 'Đăng nhập thất bại')
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      {/* CSS Nhúng trực tiếp để tạo hiệu ứng riêng cho trang này */}
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          overflow: hidden;
          background-color: #f8f9fa;
        }
        .login-side-image {
          flex: 1;
          background-image: url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          position: relative;
          display: none;
        }
        .login-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.8), rgba(102, 16, 242, 0.8));
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          padding: 40px;
          text-align: center;
        }
        .login-form-container {
          flex: 0 0 500px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 50px;
          background: white;
          box-shadow: -5px 0 20px rgba(0,0,0,0.05);
          position: relative;
          animation: slideInRight 0.6s ease-out;
        }
        .input-group-text {
          background-color: #f8f9fa;
          border-right: none;
        }
        .form-control {
          border-left: none;
          padding-left: 0;
        }
        .form-control:focus {
          box-shadow: none;
          border-color: #ced4da;
        }
        .input-group:focus-within {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
          border-radius: 0.375rem;
        }
        .input-group:focus-within .input-group-text,
        .input-group:focus-within .form-control {
          border-color: #86b7fe;
        }
        .btn-gradient {
          background: linear-gradient(90deg, #0d6efd, #6610f2);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        .btn-gradient:hover {
          background: linear-gradient(90deg, #0b5ed7, #520dc2);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
          color: white;
        }
        .btn-gradient:disabled {
          background: #ccc;
          transform: none;
          box-shadow: none;
        }
        
        /* Responsive */
        @media (min-width: 992px) {
          .login-side-image { display: block; }
        }
        @media (max-width: 991px) {
          .login-form-container { flex: 1; }
        }

        /* Animations */
        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-up {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>

      {/* Phần Hình Ảnh (Trái) */}
      <div className="login-side-image">
        <div className="login-overlay">
          <h1 className="display-4 fw-bold mb-3 animate-up">Shop Nội Thất VP</h1>
          <p className="lead animate-up" style={{animationDelay: '0.2s'}}>
            Kiến tạo không gian làm việc chuyên nghiệp, hiện đại và đầy cảm hứng.
          </p>
          <div className="mt-4 animate-up" style={{animationDelay: '0.4s'}}>
            <i className="fas fa-couch fa-2x mx-3"></i>
            <i className="fas fa-chair fa-2x mx-3"></i>
            <i className="fas fa-desktop fa-2x mx-3"></i>
          </div>
        </div>
      </div>

      {/* Phần Form Đăng Nhập (Phải) */}
      <div className="login-form-container">
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <div className="text-center mb-5">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
              <i className="fas fa-user-lock fa-2x"></i>
            </div>
            <h2 className="fw-bold">Chào mừng trở lại!</h2>
            <p className="text-muted">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 shadow-sm rounded-3 fade show" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold small text-secondary text-uppercase">Tài khoản</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="fas fa-envelope text-muted"></i></span>
                <input
                  type="text"
                  className="form-control"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  placeholder="Username hoặc Email"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-bold small text-secondary text-uppercase">Mật khẩu</label>
                <Link to="/forgot-password" class="text-decoration-none small">Quên mật khẩu?</Link>
              </div>
              <div className="input-group input-group-lg">
                <span className="input-group-text"><i className="fas fa-key text-muted"></i></span>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gradient btn-lg w-100 py-3 fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang xác thực...
                </>
              ) : (
                <>
                  ĐĂNG NHẬP <i className="fas fa-arrow-right ms-2"></i>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-muted">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary text-decoration-none fw-bold">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login