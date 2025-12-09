import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navigation from './Navigation'
import { productService } from '../services/productService'
import { cartService } from '../services/cartService'
import { useAuth } from '../context/AuthContext'

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProduct()
  }, [slug])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const productData = await productService.getProductBySlug(slug)
      setProduct(productData)
    } catch (error) {
      console.error('Error loading product:', error)
      setMessage('Không tìm thấy sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setAddingToCart(true)
      await cartService.addToCart(product.id, quantity)
      setMessage('Đã thêm vào giỏ hàng!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Lỗi khi thêm vào giỏ hàng')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setAddingToCart(false)
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

  if (!product) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div className="container my-5">
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {message || 'Không tìm thấy sản phẩm'}
          </div>
          <Link to="/products" className="btn btn-primary">
            <i className="fas fa-arrow-left me-2"></i>Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/home">Trang chủ</Link></li>
            <li className="breadcrumb-item"><Link to="/products">Sản phẩm</Link></li>
            <li className="breadcrumb-item active">{product.name}</li>
          </ol>
        </nav>

        {message && (
          <div className={`alert ${message.includes('Lỗi') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <img
              // ĐÃ SỬA: Thay bằng placehold.co
              src={product.images && product.images.length > 0 
                ? product.images[0].imageUrl 
                : 'https://placehold.co/600x400?text=No+Image'}
              className="img-fluid rounded shadow"
              alt={product.name}
            />
          </div>
          <div className="col-md-6">
            <h1 className="mb-3">{product.name}</h1>
            
            <div className="mb-3">
              {product.salePrice ? (
                <>
                  <span className="text-danger fw-bold fs-3">{formatPrice(product.salePrice)}</span>
                  <span className="text-muted text-decoration-line-through ms-3 fs-5">
                    {formatPrice(product.price)}
                  </span>
                  <span className="badge bg-danger ms-2 fs-6">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-primary fw-bold fs-3">{formatPrice(product.price)}</span>
              )}
            </div>

            <div className="mb-3">
              <p className="text-muted">{product.description || product.shortDescription}</p>
            </div>

            <div className="mb-3">
              <table className="table table-bordered">
                <tbody>
                  {product.sku && (
                    <tr>
                      <th>SKU</th>
                      <td>{product.sku}</td>
                    </tr>
                  )}
                  {product.brand && (
                    <tr>
                      <th>Thương hiệu</th>
                      <td>{product.brand}</td>
                    </tr>
                  )}
                  {product.material && (
                    <tr>
                      <th>Chất liệu</th>
                      <td>{product.material}</td>
                    </tr>
                  )}
                  {product.color && (
                    <tr>
                      <th>Màu sắc</th>
                      <td>{product.color}</td>
                    </tr>
                  )}
                  {product.dimensions && (
                    <tr>
                      <th>Kích thước</th>
                      <td>{product.dimensions}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Tồn kho</th>
                    <td>
                      {product.stockQuantity > 0 ? (
                        <span className="text-success">{product.stockQuantity} sản phẩm</span>
                      ) : (
                        <span className="text-danger">Hết hàng</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {product.stockQuantity > 0 && (
              <div className="mb-3">
                <label className="form-label">Số lượng:</label>
                <div className="input-group" style={{ maxWidth: '200px' }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stockQuantity}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || addingToCart}
              >
                {addingToCart ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <i className="fas fa-shopping-cart me-2"></i>
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
              <Link to="/cart" className="btn btn-outline-primary btn-lg">
                <i className="fas fa-shopping-bag me-2"></i>
                Xem giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail