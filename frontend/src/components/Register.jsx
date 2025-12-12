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

    // Validation cơ bản
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

    // Giả lập độ trễ để hiển thị hiệu ứng loading mượt mà
    await new Promise(resolve => setTimeout(resolve, 800))

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber || null
    })
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.message || 'Đăng ký thất bại')
    }
    
    setLoading(false)
  }

  return (
    <div className="register-wrapper">
      {/* CSS Nhúng trực tiếp (giống trang Login nhưng tùy chỉnh cho Register) */}
      <style>{`
        .register-wrapper {
          min-height: 100vh;
          display: flex;
          overflow: hidden;
          background-color: #f8f9fa;
        }
        .register-side-image {
          flex: 1;
          /* Ảnh khác với trang login để tạo sự mới mẻ */
          background-image: url('https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          position: relative;
          display: none;
        }
        .register-overlay {
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
        .register-form-container {
          flex: 0 0 550px; /* Rộng hơn login một chút vì form dài hơn */
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px;
          background: white;
          box-shadow: -5px 0 20px rgba(0,0,0,0.05);
          position: relative;
          overflow-y: auto; /* Cho phép cuộn nếu màn hình thấp */
          animation: slideInLeft 0.6s ease-out; /* Trượt từ trái sang (ngược với login) */
        }
        .input-group-text {
          background-color: #f8f9fa;
          border-right: none;
          width: 45px;
          justify-content: center;
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
        
        /* Responsive */
        @media (min-width: 992px) {
          .register-side-image { display: block; }
        }
        @media (max-width: 991px) {
          .register-form-container { flex: 1; }
        }

        /* Animations */
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
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

      {/* Phần Form (Bên Trái) - Đảo vị trí so với Login cho lạ mắt */}
      <div className="register-form-container">
        <div style={{ maxWidth: '450px', margin: '0 auto', width: '100%' }}>
          
          {/* === TRƯỜNG HỢP ĐĂNG KÝ THÀNH CÔNG === */}
          {success ? (
            <div className="text-center py-5 animate-up">
              <div className="mb-4 text-success">
                <i className="fas fa-check-circle fa-5x"></i>
              </div>
              <h2 className="fw-bold text-success mb-3">Đăng ký thành công!</h2>
              
              <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 p-4 mb-4">
                <i className="fas fa-envelope-open-text fa-2x mb-2 d-block"></i>
                <strong>Kiểm tra email của bạn!</strong>
                <p className="mb-0 mt-2 small">
                  Chúng tôi đã gửi email xác thực đến <strong>{formData.email}</strong>.<br/>
                  Vui lòng nhấn vào link trong email để kích hoạt tài khoản.
                </p>
              </div>

              <div className="alert alert-light border shadow-sm small text-muted text-start mb-4">
                <i className="fas fa-info-circle me-2"></i>
                Lưu ý: Nếu không thấy email, vui lòng kiểm tra thư mục Spam hoặc Quảng cáo.
              </div>

              <Link to="/login" className="btn btn-gradient w-100 py-3 rounded-pill fw-bold">
                <i className="fas fa-arrow-left me-2"></i> Quay lại Đăng nhập
              </Link>
            </div>
          ) : (
            /* === FORM ĐĂNG KÝ === */
            <>
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <i className="fas fa-user-plus fa-lg"></i>
                </div>
                <h2 className="fw-bold">Tạo tài khoản mới</h2>
                <p className="text-muted small">Nhập thông tin chi tiết để đăng ký</p>
              </div>

              {error && (
                <div className="alert alert-danger border-0 shadow-sm rounded-3 fade show" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Hàng 1: Username & Email */}
                  <div className="col-12">
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-user text-muted"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Tên đăng nhập"
                        required
                        minLength={3}
                      />
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-envelope text-muted"></i></span>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Địa chỉ Email"
                        required
                      />
                    </div>
                  </div>

                  {/* Hàng 2: Họ tên & SĐT */}
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-id-card text-muted"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Họ và tên"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-phone text-muted"></i></span>
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Số điện thoại"
                        required
                      />
                    </div>
                  </div>

                  {/* Hàng 3: Mật khẩu */}
                  <div className="col-12">
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-lock text-muted"></i></span>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mật khẩu (min 6 ký tự)"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-check-double text-muted"></i></span>
                      <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Xác nhận mật khẩu"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-gradient btn-lg w-100 py-3 fw-bold shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        ĐĂNG KÝ NGAY <i className="fas fa-arrow-right ms-2"></i>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted">Đã có tài khoản? </span>
                <Link to="/login" className="text-primary text-decoration-none fw-bold ms-1">
                  Đăng nhập tại đây
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Phần Hình Ảnh (Bên Phải) */}
      <div className="register-side-image">
        <div className="register-overlay">
          <h1 className="display-4 fw-bold mb-3 animate-up">Tham Gia Cùng Chúng Tôi</h1>
          <p className="lead fs-5 animate-up" style={{animationDelay: '0.2s', maxWidth: '80%'}}>
            Trở thành thành viên để nhận ngay ưu đãi độc quyền và trải nghiệm mua sắm nội thất đẳng cấp.
          </p>
          <div className="mt-4 d-flex gap-3 animate-up" style={{animationDelay: '0.4s'}}>
            <div className="bg-white bg-opacity-25 p-3 rounded-3 backdrop-blur text-white">
              <i className="fas fa-gift fa-2x mb-2"></i>
              <div className="small fw-bold">Voucher Hot</div>
            </div>
            <div className="bg-white bg-opacity-25 p-3 rounded-3 backdrop-blur text-white">
              <i className="fas fa-truck-fast fa-2x mb-2"></i>
              <div className="small fw-bold">Freeship</div>
            </div>
            <div className="bg-white bg-opacity-25 p-3 rounded-3 backdrop-blur text-white">
              <i className="fas fa-medal fa-2x mb-2"></i>
              <div className="small fw-bold">Bảo hành</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register