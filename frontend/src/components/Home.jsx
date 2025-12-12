import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import { productService } from '../services/productService'
import IntroPopup from './IntroPopup'
import axios from 'axios'

// --- BIẾN TOÀN CỤC ---
// Biến này nằm ngoài component, chỉ bị reset khi tải lại trang (F5 hoặc window.location.href)
// Khi chuyển trang bằng React Router (Link, navigate), biến này giữ nguyên giá trị.
let hasShownPopupThisSession = false;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [bestSellingProducts, setBestSellingProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State quản lý Banner Popup
  const [showIntro, setShowIntro] = useState(false)
  const [popupData, setPopupData] = useState(null)

  useEffect(() => {
    loadProducts()
    loadPopupBanner()
  }, [])

  const loadPopupBanner = async () => {
    // Nếu đã hiện trong phiên làm việc này rồi thì bỏ qua
    if (hasShownPopupThisSession) return;

    try {
      // Gọi API lấy banner có position='POPUP'
      // Lưu ý: Đảm bảo backend đang chạy ở cổng 8082
      const response = await axios.get('http://localhost:8082/api/banners/popup')
      
      if (response.data) {
        setPopupData(response.data)
        setShowIntro(true)
      }
    } catch (error) {
      console.error("Không tải được banner popup hoặc chưa có banner nào active.")
    }
  }

  const handleClosePopup = () => {
    setShowIntro(false)
    // Đánh dấu là đã xem xong => Chuyển trang quay lại sẽ không hiện nữa
    hasShownPopupThisSession = true 
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const [featured, bestSelling] = await Promise.all([
        productService.getFeaturedProducts(0, 4),
        productService.getBestSellingProducts(0, 4)
      ])
      setFeaturedProducts(featured.content || [])
      setBestSellingProducts(bestSelling.content || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  return (
    <div className="min-vh-100 bg-light">
      
      {/* Chỉ hiển thị khi có dữ liệu và showIntro = true */}
      {showIntro && popupData && (
        <IntroPopup bannerData={popupData} onClose={handleClosePopup} />
      )}

      <Navigation />

      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-4">
        <div className="container text-center">
          <h1 className="display-4 mb-3">
            <i className="fas fa-store me-3"></i>
            Shop Nội Thất Văn Phòng
          </h1>
          <p className="lead">Nơi cung cấp nội thất văn phòng chất lượng cao, uy tín hàng đầu</p>
          <Link to="/products" className="btn btn-light btn-lg mt-3 shadow-sm fw-bold">
            <i className="fas fa-shopping-bag me-2"></i>
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>

      <div className="container">
        {/* Featured Products */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-star text-warning me-2"></i>
              Sản phẩm nổi bật
            </h2>
            <Link to="/products" className="btn btn-outline-primary">
              Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {featuredProducts.map((product) => (
                <div key={product.id} className="col-md-3 mb-4">
                  <div className="card h-100 shadow-sm border-0">
                    <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none">
                      <img
                        src={product.images && product.images.length > 0 
                          ? product.images[0].imageUrl 
                          : 'https://placehold.co/300x200?text=No+Image'}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    </Link>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate">
                        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark">
                          {product.name}
                        </Link>
                      </h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {product.shortDescription?.substring(0, 60)}...
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-2">
                            {product.salePrice ? (
                            <>
                                <span className="text-danger fw-bold me-2">{formatPrice(product.salePrice)}</span>
                                <span className="text-muted text-decoration-line-through small">
                                {formatPrice(product.price)}
                                </span>
                            </>
                            ) : (
                            <span className="text-primary fw-bold">{formatPrice(product.price)}</span>
                            )}
                        </div>
                        <Link
                            to={`/products/${product.slug || product.id}`}
                            className="btn btn-primary btn-sm w-100"
                        >
                            <i className="fas fa-eye me-2"></i>Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Best Selling Products */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-fire text-danger me-2"></i>
              Sản phẩm bán chạy
            </h2>
            <Link to="/products" className="btn btn-outline-primary">
              Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="row">
              {bestSellingProducts.map((product) => (
                <div key={product.id} className="col-md-3 mb-4">
                  <div className="card h-100 shadow-sm border-0">
                    <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none">
                      <img
                        src={product.images && product.images.length > 0 
                          ? product.images[0].imageUrl 
                          : 'https://placehold.co/300x200?text=No+Image'}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    </Link>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate">
                        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark">
                          {product.name}
                        </Link>
                      </h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {product.shortDescription?.substring(0, 60)}...
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-2">
                            {product.salePrice ? (
                            <>
                                <span className="text-danger fw-bold me-2">{formatPrice(product.salePrice)}</span>
                                <span className="text-muted text-decoration-line-through small">
                                {formatPrice(product.price)}
                                </span>
                            </>
                            ) : (
                            <span className="text-primary fw-bold">{formatPrice(product.price)}</span>
                            )}
                        </div>
                        <Link
                            to={`/products/${product.slug || product.id}`}
                            className="btn btn-primary btn-sm w-100"
                        >
                            <i className="fas fa-eye me-2"></i>Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="bg-dark text-white text-center py-4 mt-5">
        <div className="container">
          <p className="mb-0">&copy; 2024 Shop Nội Thất Văn Phòng. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home