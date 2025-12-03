import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navigation from './Navigation'
import { cartService } from '../services/cartService'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      const items = await cartService.getCart()
      setCartItems(items)
      calculateTotal(items)
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      const price = item.product.salePrice || item.product.price
      return acc + (price * item.quantity)
    }, 0)
    setTotal(sum)
  }

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return
    try {
      await cartService.updateQuantity(cartItemId, newQuantity)
      await loadCart()
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleRemove = async (cartItemId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      try {
        await cartService.removeFromCart(cartItemId)
        await loadCart()
      } catch (error) {
        console.error('Error removing item:', error)
      }
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <h2 className="mb-4">
          <i className="fas fa-shopping-cart me-2"></i>
          Giỏ hàng của bạn
        </h2>

        {cartItems.length === 0 ? (
          <div className="alert alert-info text-center">
            <i className="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
            <h4>Giỏ hàng trống</h4>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/products" className="btn btn-primary">
              <i className="fas fa-shopping-bag me-2"></i>Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border-bottom pb-3 mb-3">
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <img
                            src={item.product.images && item.product.images.length > 0
                              ? item.product.images[0].imageUrl
                              : 'https://via.placeholder.com/100?text=No+Image'}
                            className="img-fluid rounded"
                            alt={item.product.name}
                          />
                        </div>
                        <div className="col-md-4">
                          <h5 className="mb-1">
                            <Link to={`/products/${item.product.slug || item.product.id}`} className="text-decoration-none">
                              {item.product.name}
                            </Link>
                          </h5>
                          <p className="text-muted small mb-0">
                            {item.product.shortDescription?.substring(0, 50)}...
                          </p>
                        </div>
                        <div className="col-md-2 text-center">
                          <div className="input-group input-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={item.quantity}
                              readOnly
                              style={{ maxWidth: '60px' }}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <strong className="text-primary">
                            {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                          </strong>
                        </div>
                        <div className="col-md-2 text-end">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemove(item.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Tóm tắt đơn hàng</h5>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Phí vận chuyển:</span>
                    <span className="text-muted">Tính khi thanh toán</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Tổng cộng:</strong>
                    <strong className="text-danger fs-5">{formatPrice(total)}</strong>
                  </div>
                  <div className="d-grid gap-2">
                    <Link to="/checkout" className="btn btn-primary btn-lg">
                      <i className="fas fa-credit-card me-2"></i>
                      Thanh toán
                    </Link>
                    <Link to="/products" className="btn btn-outline-secondary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart



