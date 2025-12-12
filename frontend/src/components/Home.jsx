import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import { productService } from '../services/productService'
import IntroPopup from './IntroPopup'
import axios from 'axios'

// --- BIẾN TOÀN CỤC ---
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
    if (hasShownPopupThisSession) return;
    try {
      const response = await axios.get('http://localhost:8082/api/banners/popup')
      if (response.data) {
        setPopupData(response.data)
        setShowIntro(true)
      }
    } catch (error) {
      console.error("Không tải được banner popup")
    }
  }

  const handleClosePopup = () => {
    setShowIntro(false)
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
      
      {showIntro && popupData && (
        <IntroPopup bannerData={popupData} onClose={handleClosePopup} />
      )}

      <Navigation />

      {/* === 1. CAROUSEL SLIDER (BANNER CHẠY) === */}
      <div id="homeCarousel" className="carousel slide shadow-sm mb-5" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2"></button>
        </div>
        <div className="carousel-inner rounded-bottom">
          {/* Slide 1 */}
          <div className="carousel-item active" style={{ height: '500px' }}>
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
              className="d-block w-100 h-100" 
              style={{ objectFit: 'cover', filter: 'brightness(0.7)' }}
              alt="Office" 
            />
            <div className="carousel-caption d-none d-md-block pb-5">
              <h1 className="display-3 fw-bold animate__animated animate__fadeInDown">Nâng Tầm Không Gian Làm Việc</h1>
              <p className="lead fs-4 animate__animated animate__fadeInUp">Thiết kế hiện đại, tối ưu hiệu suất cho văn phòng của bạn.</p>
              <Link to="/products" className="btn btn-primary btn-lg mt-3 px-5 py-3 rounded-pill shadow fw-bold animate__animated animate__zoomIn">
                Mua Ngay
              </Link>
            </div>
          </div>
          {/* Slide 2 */}
          <div className="carousel-item" style={{ height: '500px' }}>
            <img 
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop" 
              className="d-block w-100 h-100" 
              style={{ objectFit: 'cover', filter: 'brightness(0.7)' }}
              alt="Furniture" 
            />
            <div className="carousel-caption d-none d-md-block pb-5">
              <h1 className="display-3 fw-bold">Ghế Văn Phòng Ergonomic</h1>
              <p className="lead fs-4">Bảo vệ sức khỏe cột sống, thoải mái làm việc cả ngày dài.</p>
              <Link to="/products?category=ghe-van-phong" className="btn btn-light btn-lg mt-3 px-5 py-3 rounded-pill shadow fw-bold text-primary">
                Xem Bộ Sưu Tập
              </Link>
            </div>
          </div>
          {/* Slide 3 */}
          <div className="carousel-item" style={{ height: '500px' }}>
            <img 
              src="https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=2070&auto=format&fit=crop" 
              className="d-block w-100 h-100" 
              style={{ objectFit: 'cover', filter: 'brightness(0.7)' }}
              alt="Desk" 
            />
            <div className="carousel-caption d-none d-md-block pb-5">
              <h1 className="display-3 fw-bold">Khuyến Mãi Mùa Hè</h1>
              <p className="lead fs-4">Giảm giá lên đến 50% cho các sản phẩm bàn làm việc.</p>
              <Link to="/discounted" className="btn btn-warning btn-lg mt-3 px-5 py-3 rounded-pill shadow fw-bold text-dark">
                Săn Deal Hot
              </Link>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* === 2. DỊCH VỤ & CAM KẾT (TRUST BADGES) === */}
      <div className="container mb-5">
        <div className="row g-4">
          <div className="col-md-3 col-6">
            <div className="d-flex flex-column align-items-center text-center p-3 bg-white rounded shadow-sm h-100">
              <i className="fas fa-truck-fast fa-3x text-primary mb-3"></i>
              <h6 className="fw-bold">Miễn Phí Vận Chuyển</h6>
              <small className="text-muted">Cho đơn hàng trên 5 triệu</small>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="d-flex flex-column align-items-center text-center p-3 bg-white rounded shadow-sm h-100">
              <i className="fas fa-shield-alt fa-3x text-success mb-3"></i>
              <h6 className="fw-bold">Bảo Hành 2 Năm</h6>
              <small className="text-muted">Cam kết chất lượng chính hãng</small>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="d-flex flex-column align-items-center text-center p-3 bg-white rounded shadow-sm h-100">
              <i className="fas fa-undo fa-3x text-warning mb-3"></i>
              <h6 className="fw-bold">Đổi Trả Trong 7 Ngày</h6>
              <small className="text-muted">Nếu có lỗi từ nhà sản xuất</small>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="d-flex flex-column align-items-center text-center p-3 bg-white rounded shadow-sm h-100">
              <i className="fas fa-headset fa-3x text-danger mb-3"></i>
              <h6 className="fw-bold">Hỗ Trợ 24/7</h6>
              <small className="text-muted">Hotline: 1900 xxxx</small>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* === 3. DANH MỤC NỔI BẬT === */}
        <section className="mb-5">
          <h3 className="text-center mb-4 text-uppercase fw-bold ls-2">
            <span className="border-bottom border-3 border-primary pb-2">Danh Mục Sản Phẩm</span>
          </h3>
          <div className="row g-3">
            {[
              { name: 'Bàn Làm Việc', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1935', link: '/products?keyword=bàn' },
              { name: 'Ghế Văn Phòng', img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=2070', link: '/products?keyword=ghế' },
              { name: 'Tủ Hồ Sơ', img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1974', link: '/products?keyword=tủ' },
              { name: 'Kệ Sách', img: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=2039', link: '/products?keyword=kệ' }
            ].map((cat, idx) => (
              <div key={idx} className="col-md-3 col-6">
                <Link to={cat.link} className="card border-0 text-white shadow-sm overflow-hidden zoom-effect" style={{ textDecoration: 'none' }}>
                  <img src={cat.img} className="card-img" alt={cat.name} style={{ height: '200px', objectFit: 'cover', transition: 'transform 0.5s' }} />
                  <div className="card-img-overlay d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <h5 className="card-title fw-bold text-uppercase border-bottom border-light pb-1">{cat.name}</h5>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* === 4. SẢN PHẨM NỔI BẬT === */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-primary">
              <i className="fas fa-star text-warning me-2"></i>Sản Phẩm Nổi Bật
            </h2>
            <Link to="/products" className="btn btn-outline-primary rounded-pill px-4">
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
            <div className="row g-4">
              {featuredProducts.map((product) => (
                <div key={product.id} className="col-md-3 col-sm-6">
                  <div className="card h-100 shadow-sm border-0 product-card">
                    <div className="position-relative overflow-hidden">
                      <Link to={`/products/${product.slug || product.id}`}>
                        <img
                          src={product.images && product.images.length > 0 
                            ? product.images[0].imageUrl 
                            : 'https://placehold.co/300x200?text=No+Image'}
                          className="card-img-top product-img"
                          alt={product.name}
                          style={{ height: '220px', objectFit: 'cover', transition: 'transform 0.3s' }}
                        />
                      </Link>
                      {product.salePrice && (
                        <span className="position-absolute top-0 start-0 badge bg-danger m-2 px-3 py-2 shadow-sm rounded-pill">
                          -{Math.round((1 - product.salePrice / product.price) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate mb-1">
                        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark fw-bold product-title">
                          {product.name}
                        </Link>
                      </h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {product.shortDescription?.substring(0, 50)}...
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-3">
                            {product.salePrice ? (
                            <>
                                <span className="text-danger fw-bold fs-5 me-2">{formatPrice(product.salePrice)}</span>
                                <span className="text-muted text-decoration-line-through small">
                                {formatPrice(product.price)}
                                </span>
                            </>
                            ) : (
                            <span className="text-primary fw-bold fs-5">{formatPrice(product.price)}</span>
                            )}
                        </div>
                        <Link
                            to={`/products/${product.slug || product.id}`}
                            className="btn btn-primary w-100 rounded-pill shadow-sm"
                        >
                            <i className="fas fa-shopping-cart me-2"></i>Thêm vào giỏ
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* === 5. SẢN PHẨM BÁN CHẠY === */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-danger">
              <i className="fas fa-fire me-2"></i>Sản Phẩm Bán Chạy
            </h2>
            <Link to="/products" className="btn btn-outline-danger rounded-pill px-4">
              Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status"></div>
            </div>
          ) : (
            <div className="row g-4">
              {bestSellingProducts.map((product) => (
                <div key={product.id} className="col-md-3 col-sm-6">
                  <div className="card h-100 shadow-sm border-0 product-card">
                    <div className="position-relative overflow-hidden">
                      <Link to={`/products/${product.slug || product.id}`}>
                        <img
                          src={product.images && product.images.length > 0 
                            ? product.images[0].imageUrl 
                            : 'https://placehold.co/300x200?text=No+Image'}
                          className="card-img-top product-img"
                          alt={product.name}
                          style={{ height: '220px', objectFit: 'cover', transition: 'transform 0.3s' }}
                        />
                      </Link>
                      <span className="position-absolute top-0 end-0 badge bg-warning text-dark m-2 px-3 py-2 shadow-sm rounded-pill">
                        <i className="fas fa-bolt me-1"></i>Hot
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate mb-1">
                        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark fw-bold product-title">
                          {product.name}
                        </Link>
                      </h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {product.shortDescription?.substring(0, 50)}...
                      </p>
                      <div className="mt-auto">
                        <div className="d-flex align-items-center mb-3">
                            {product.salePrice ? (
                            <>
                                <span className="text-danger fw-bold fs-5 me-2">{formatPrice(product.salePrice)}</span>
                                <span className="text-muted text-decoration-line-through small">
                                {formatPrice(product.price)}
                                </span>
                            </>
                            ) : (
                            <span className="text-primary fw-bold fs-5">{formatPrice(product.price)}</span>
                            )}
                        </div>
                        <Link
                            to={`/products/${product.slug || product.id}`}
                            className="btn btn-outline-danger w-100 rounded-pill"
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

      {/* Footer */}
      <footer className="bg-dark text-white pt-5 pb-4 mt-5">
        <div className="container text-center text-md-start">
          <div className="row text-center text-md-start">
            <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 fw-bold text-warning">Shop Nội Thất VP</h5>
              <p>Chuyên cung cấp nội thất văn phòng chính hãng, thiết kế hiện đại, giá cả cạnh tranh nhất thị trường.</p>
            </div>
            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 fw-bold text-warning">Sản phẩm</h5>
              <p><Link to="/products" className="text-white text-decoration-none">Bàn làm việc</Link></p>
              <p><Link to="/products" className="text-white text-decoration-none">Ghế văn phòng</Link></p>
              <p><Link to="/products" className="text-white text-decoration-none">Tủ hồ sơ</Link></p>
            </div>
            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 fw-bold text-warning">Liên kết</h5>
              <p><Link to="/profile" className="text-white text-decoration-none">Tài khoản của bạn</Link></p>
              <p><Link to="/cart" className="text-white text-decoration-none">Giỏ hàng</Link></p>
              <p><Link to="/orders" className="text-white text-decoration-none">Tra cứu đơn hàng</Link></p>
            </div>
            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 fw-bold text-warning">Liên hệ</h5>
              <p><i className="fas fa-home me-3"></i> Hồ Chí Minh, Việt Nam</p>
              <p><i className="fas fa-envelope me-3"></i>noithat_vp@gmail.com</p>
              <p><i className="fas fa-phone me-3"></i> + 84 779 624 173</p>
            </div>
          </div>
          <hr className="mb-4" />
          <div className="row align-items-center">
            <div className="col-md-7 col-lg-8">
              <p>© 2024 Bản quyền thuộc về <strong className="text-warning">Shop Nội Thất Văn Phòng</strong>.</p>
            </div>
            <div className="col-md-5 col-lg-4">
              <div className="text-center text-md-end">
                <ul className="list-unstyled list-inline">
                  <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white fs-5"><i className="fab fa-facebook"></i></a></li>
                  <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white fs-5"><i className="fab fa-twitter"></i></a></li>
                  <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white fs-5"><i className="fab fa-google-plus"></i></a></li>
                  <li className="list-inline-item"><a href="#" className="btn-floating btn-sm text-white fs-5"><i className="fab fa-linkedin-in"></i></a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home