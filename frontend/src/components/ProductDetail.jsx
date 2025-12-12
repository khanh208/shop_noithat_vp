import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navigation from './Navigation'
import { productService } from '../services/productService'
import { cartService } from '../services/cartService'
import { useAuth } from '../context/AuthContext'
import { reviewService } from '../services/reviewService'
import { wishlistService } from '../services/wishlistService'

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  // State sản phẩm
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [message, setMessage] = useState('')
  const [isLiked, setIsLiked] = useState(false) // State cho nút yêu thích

  // State cho Review
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  // 1. Load sản phẩm khi slug thay đổi
  useEffect(() => {
    loadProduct()
  }, [slug])

  // 2. Load reviews và trạng thái wishlist khi có product
  useEffect(() => {
    if (product?.id) {
      loadReviews(product.id)
      
      if (isAuthenticated) {
        wishlistService.checkWishlist(product.id).then(setIsLiked)
      }
    }
  }, [product, isAuthenticated])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const productData = await productService.getProductBySlug(slug)
      setProduct(productData)
      setQuantity(1)
    } catch (error) {
      console.error('Error loading product:', error)
      setMessage('Không tìm thấy sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async (productId) => {
    try {
      setLoadingReviews(true)
      const data = await reviewService.getProductReviews(productId)
      setReviews(data.content || [])
    } catch (error) {
      console.error('Lỗi tải đánh giá', error)
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (quantity < 1 || quantity > product.stockQuantity) {
        alert("Số lượng không hợp lệ")
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

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
        alert("Vui lòng đăng nhập để sử dụng tính năng này")
        return
    }
    try {
        await wishlistService.toggleWishlist(product.id)
        setIsLiked(!isLiked) // Đổi trạng thái tim
    } catch (error) {
        console.error(error)
    }
  }

  const handleQuantityChange = (e) => {
    const val = e.target.value
    if (val === '') {
        setQuantity('')
        return
    }
    const parsed = parseInt(val)
    if (!isNaN(parsed)) {
        if (parsed > product.stockQuantity) {
            setQuantity(product.stockQuantity)
        } else {
            setQuantity(parsed)
        }
    }
  }

  const handleQuantityBlur = () => {
    if (quantity === '' || quantity < 1) {
        setQuantity(1)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <i key={index} className={`fas fa-star ${index < rating ? 'text-warning' : 'text-muted'}`}></i>
    ))
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div className="container my-5">
          <div className="alert alert-warning">Sản phẩm không tồn tại</div>
          <Link to="/products" className="btn btn-primary">Quay lại</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        {/* Breadcrumb & Alert */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/home">Trang chủ</Link></li>
            <li className="breadcrumb-item"><Link to="/products">Sản phẩm</Link></li>
            <li className="breadcrumb-item active">{product.name}</li>
          </ol>
        </nav>

        {message && (
          <div className={`alert ${message.includes('Lỗi') ? 'alert-danger' : 'alert-success'} position-fixed top-0 end-0 m-3`} style={{zIndex: 9999}}>
            {message}
          </div>
        )}

        {/* Product Info Section */}
        <div className="row mb-5">
          <div className="col-md-6">
            <img
              src={product.images && product.images.length > 0 
                ? product.images[0].imageUrl 
                : 'https://placehold.co/600x400?text=No+Image'}
              className="img-fluid rounded shadow-sm w-100"
              alt={product.name}
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="col-md-6">
            <h1 className="mb-2">{product.name}</h1>
            <div className="mb-3 text-warning small">
                {renderStars(5)} <span className="text-muted ms-2">({reviews.length} đánh giá)</span>
            </div>
            
            <div className="mb-4">
              {product.salePrice ? (
                <>
                  <span className="text-danger fw-bold fs-2 me-3">{formatPrice(product.salePrice)}</span>
                  <span className="text-muted text-decoration-line-through fs-5">
                    {formatPrice(product.price)}
                  </span>
                  <span className="badge bg-danger ms-2">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-primary fw-bold fs-2">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-muted mb-4">{product.shortDescription}</p>

            <table className="table table-sm table-borderless mb-4">
              <tbody>
                {product.brand && <tr><td className="text-muted" width="100">Thương hiệu:</td><td>{product.brand}</td></tr>}
                {product.sku && <tr><td className="text-muted">Mã SKU:</td><td>{product.sku}</td></tr>}
                <tr>
                    <td className="text-muted">Kho hàng:</td>
                    <td>
                        {product.stockQuantity > 0 ? (
                            <span className="text-success fw-bold">{product.stockQuantity} sản phẩm</span>
                        ) : (
                            <span className="text-danger fw-bold">Hết hàng</span>
                        )}
                    </td>
                </tr>
              </tbody>
            </table>

            {product.stockQuantity > 0 && (
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="input-group" style={{ width: '130px' }}>
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => setQuantity(prev => Math.max(1, (Number(prev) || 0) - 1))}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    className="form-control text-center" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityBlur}
                    min="1"
                    max={product.stockQuantity}
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={() => setQuantity(prev => Math.min(product.stockQuantity, (Number(prev) || 0) + 1))}
                  >
                    +
                  </button>
                </div>
                
                <button
                  className="btn btn-primary btn-lg flex-grow-1"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Đang thêm...</> 
                  ) : (
                    <><i className="fas fa-cart-plus me-2"></i>Thêm vào giỏ</>
                  )}
                </button>
                
                <button 
                    className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'} btn-lg`}
                    onClick={handleToggleWishlist}
                    title={isLiked ? "Bỏ thích" : "Thêm vào yêu thích"}
                >
                    <i className={`fas fa-heart ${isLiked ? '' : 'text-danger'}`}></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description & Reviews Tabs */}
        <div className="row">
            <div className="col-12">
                <div className="card shadow-sm">
                    <div className="card-header bg-white">
                        <ul className="nav nav-tabs card-header-tabs" id="myTab" role="tablist">
                            <li className="nav-item">
                                <button className="nav-link active" id="desc-tab" data-bs-toggle="tab" data-bs-target="#desc" type="button">
                                    Mô tả chi tiết
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link" id="review-tab" data-bs-toggle="tab" data-bs-target="#review" type="button">
                                    Đánh giá ({reviews.length})
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="card-body">
                        <div className="tab-content" id="myTabContent">
                            {/* Mô tả */}
                            <div className="tab-pane fade show active" id="desc" role="tabpanel">
                                <div style={{whiteSpace: 'pre-line'}}>
                                    {product.description || "Đang cập nhật..."}
                                </div>
                            </div>

                            {/* Đánh giá */}
                            <div className="tab-pane fade" id="review" role="tabpanel">
                                {loadingReviews ? (
                                    <div className="text-center py-4"><span className="spinner-border text-secondary"></span></div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="far fa-comment-dots fa-3x mb-3"></i>
                                        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                                        <small>Hãy mua hàng để trở thành người đầu tiên đánh giá!</small>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {reviews.map(review => (
                                            <div key={review.id} className="list-group-item py-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                                                            {review.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0 fw-bold">{review.user?.fullName || review.user?.username || 'Khách hàng'}</h6>
                                                            <div className="small text-warning">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <small className="text-muted">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </small>
                                                </div>
                                                <p className="mb-0 ms-5 ps-2 text-dark" style={{fontSize: '0.95rem'}}>
                                                    {review.comment}
                                                </p>
                                                
                                                {/* --- HIỂN THỊ HÌNH ẢNH ĐÁNH GIÁ (Đã Fix) --- */}
                                                {review.reviewImages && (
                                                    <div className="ms-5 ps-2 mt-2">
                                                        <img 
                                                            src={review.reviewImages.startsWith('http') 
                                                                ? review.reviewImages 
                                                                : `http://localhost:8082${review.reviewImages}`} 
                                                            alt="Review" 
                                                            className="img-thumbnail" 
                                                            style={{maxHeight: '150px', cursor: 'pointer'}}
                                                            onClick={() => window.open(review.reviewImages.startsWith('http') 
                                                                ? review.reviewImages 
                                                                : `http://localhost:8082${review.reviewImages}`, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail