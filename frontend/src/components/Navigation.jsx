import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cartService } from '../services/cartService'

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      loadCartCount()
    }
  }, [isAuthenticated, location])

  const loadCartCount = async () => {
    try {
      const cartItems = await cartService.getCart()
      const count = cartItems.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) return null

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/home">
          <i className="fas fa-store me-2"></i>
          Shop Nội Thất Văn Phòng
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`} to="/home">
                <i className="fas fa-home me-1"></i> Trang chủ
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`} to="/products">
                <i className="fas fa-box me-1"></i> Sản phẩm
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`} to="/cart">
                <i className="fas fa-shopping-cart me-1"></i> Giỏ hàng
                {cartCount > 0 && <span className="badge bg-danger ms-1">{cartCount}</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`} to="/orders">
                <i className="fas fa-shopping-bag me-1"></i> Đơn hàng
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown">
                <i className="fas fa-user me-2"></i>
                {user?.username}
                {user?.role === 'ADMIN' && <span className="badge bg-danger ms-2">ADMIN</span>}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="fas fa-user-circle me-2"></i>Tài khoản
                  </Link>
                </li>
                <li>
              <Link className="dropdown-item" to="/wallet">
                <i className="fas fa-wallet me-2"></i>Ví của tôi
              </Link>
            </li>
                <li>
                  <Link className="dropdown-item" to="/orders">
                    <i className="fas fa-shopping-bag me-2"></i>Đơn hàng
                  </Link>
                </li>
                {(user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'WAREHOUSE' || user?.role === 'MARKETING') && (
                  <>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item text-danger" to="/admin">
                        <i className="fas fa-cog me-2"></i>Trang quản trị
                      </Link>
                    </li>
                  </>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Đăng xuất
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

