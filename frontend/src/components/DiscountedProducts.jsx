import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import { productService } from '../services/productService'
import { voucherService } from '../services/voucherService'

const DiscountedProducts = () => {
  const [products, setProducts] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsRes, vouchersRes] = await Promise.all([
        productService.getDiscountedProducts(0, 20), // Lấy 20 sản phẩm giảm giá
        voucherService.getActiveVouchers()           // Lấy voucher active
      ])
      
      setProducts(productsRes.content || [])
      setVouchers(vouchersRes || [])
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    alert(`Đã sao chép mã: ${code}`)
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        {/* === PHẦN 1: VOUCHER LIST === */}
        <section className="mb-5">
          <h2 className="mb-4 text-danger fw-bold">
            <i className="fas fa-ticket-alt me-2"></i>Mã Giảm Giá Hot
          </h2>
          
          {vouchers.length === 0 ? (
            <div className="alert alert-light text-center">Hiện chưa có mã giảm giá nào.</div>
          ) : (
            <div className="row g-3">
              {vouchers.map(voucher => (
                <div key={voucher.id} className="col-md-4 col-sm-6">
                  <div className="card border-danger border-2 border-dashed h-100 bg-white">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-danger fs-6">{voucher.code}</span>
                        <small className="text-muted">
                            HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                        </small>
                      </div>
                      <h5 className="card-title text-danger fw-bold">{voucher.name}</h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {voucher.description} <br/>
                        {voucher.minOrderAmount > 0 && (
                            <span>Đơn tối thiểu: {formatPrice(voucher.minOrderAmount)}</span>
                        )}
                      </p>
                      <button 
                        className="btn btn-outline-danger btn-sm w-100 mt-2 dashed-btn"
                        onClick={() => copyToClipboard(voucher.code)}
                      >
                        <i className="fas fa-copy me-1"></i>Sao chép mã
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* === PHẦN 2: DANH SÁCH SẢN PHẨM GIẢM GIÁ === */}
        <section>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">
              <i className="fas fa-percent me-2 text-warning"></i>Sản Phẩm Đang Giảm Giá
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="alert alert-info text-center">Hiện không có sản phẩm nào đang giảm giá.</div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
              {products.map((product) => (
                <div key={product.id} className="col">
                  <div className="card h-100 shadow-sm border-0 product-card">
                    <div className="position-relative overflow-hidden">
                      <Link to={`/products/${product.slug || product.id}`}>
                        <img
                          src={product.images && product.images.length > 0 
                            ? product.images[0].imageUrl 
                            : 'https://placehold.co/300x200?text=No+Image'}
                          className="card-img-top"
                          alt={product.name}
                          style={{ height: '220px', objectFit: 'cover' }}
                        />
                      </Link>
                      {/* Badge giảm giá */}
                      <span className="position-absolute top-0 end-0 badge bg-danger m-2 px-2 py-2 shadow-sm rounded-pill">
                        -{Math.round((1 - product.salePrice / product.price) * 100)}%
                      </span>
                    </div>
                    
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fs-6 mb-1 text-truncate">
                        <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark fw-bold">
                          {product.name}
                        </Link>
                      </h5>
                      
                      <div className="mt-auto pt-3">
                        <div className="mb-2">
                            <div className="d-flex align-items-center">
                                <span className="text-danger fw-bold fs-5 me-2">{formatPrice(product.salePrice)}</span>
                                <span className="text-muted text-decoration-line-through small">
                                    {formatPrice(product.price)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="d-grid">
                          <Link
                            to={`/products/${product.slug || product.id}`}
                            className="btn btn-outline-danger btn-sm rounded-pill"
                          >
                            Xem ngay
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
    </div>
  )
}

export default DiscountedProducts