import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import { productService } from '../services/productService'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [bestSellingProducts, setBestSellingProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

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
      <Navigation />

      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-4">
        <div className="container text-center">
          <h1 className="display-4 mb-3">
            <i className="fas fa-store me-3"></i>
            Shop Nội Thất Văn Phòng
          </h1>
          <p className="lead">Nơi cung cấp nội thất văn phòng chất lượng cao</p>
          <Link to="/products" className="btn btn-light btn-lg mt-3">
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
                  <div className="card h-100 shadow-sm">
                    <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none">
                      <img
                        // ĐÃ SỬA: Thay bằng placehold.co
                        src={product.images && product.images.length > 0
                          ? product.images[0].imageUrl
                          : 'https://placehold.co/300x200?text=No+Image'}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    </Link>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">
                        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark">
                          {product.name}
                        </Link>
                      </h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {product.shortDescription?.substring(0, 80)}...
                      </p>
                      <div className="mt-auto">
                        {product.salePrice ? (
                          <>
                            <span className="text-danger fw-bold">{formatPrice(product.salePrice)}</span>
                            <span className="text-muted text-decoration-line-through ms-2 small">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-primary fw-bold">{formatPrice(product.price)}</span>
                        )}
                        <div className="mt-2">
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
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {bestSellingProducts.map((product) => (
                <div key={product.id} className="col-md-3 mb-4">
                  <div className="card h-100 shadow-sm">
                    <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none">
                      <img
                        // ĐÃ SỬA: Thay bằng placehold.co
                        src={product.images && product.images.length > 0
                          ? product.images[0].imageUrl
                          : 'https://placehold.co/300x200?text=No+Image'}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    </Link>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">
                        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark">
                          {product.name}
                        </Link>
                      </h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {product.shortDescription?.substring(0, 80)}...
                      </p>
                      <div className="mt-auto">
                        {product.salePrice ? (
                          <>
                            <span className="text-danger fw-bold">{formatPrice(product.salePrice)}</span>
                            <span className="text-muted text-decoration-line-through ms-2 small">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-primary fw-bold">{formatPrice(product.price)}</span>
                        )}
                        <div className="mt-2">
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