import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import { productService } from '../services/productService'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadProducts()
  }, [page])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.getAllProducts(page, 12)
      setProducts(response.content || [])
      setTotalPages(response.totalPages || 0)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const response = await productService.searchProducts({ keyword: searchKeyword }, 0, 12)
      setProducts(response.content || [])
      setTotalPages(response.totalPages || 0)
      setPage(0)
    } catch (error) {
      console.error('Error searching products:', error)
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
      
      <div className="container my-4">
        <div className="row mb-4">
          <div className="col-md-12">
            <h2 className="mb-3">
              <i className="fas fa-box me-2"></i>
              Danh sách sản phẩm
            </h2>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn btn-primary" onClick={handleSearch}>
                <i className="fas fa-search me-2"></i>Tìm kiếm
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="alert alert-info text-center">
            <i className="fas fa-info-circle me-2"></i>
            Không tìm thấy sản phẩm nào
          </div>
        ) : (
          <>
            <div className="row">
              {products.map((product) => (
                <div key={product.id} className="col-md-3 mb-4">
                  <div className="card h-100 shadow-sm">
                    <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none">
                      <img
                        src={product.images && product.images.length > 0 
                          ? product.images[0].imageUrl 
                          : 'https://via.placeholder.com/300x200?text=No+Image'}
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
                        {product.shortDescription || product.description?.substring(0, 100)}
                      </p>
                      <div className="mt-auto">
                        <div className="mb-2">
                          {product.salePrice ? (
                            <>
                              <span className="text-danger fw-bold fs-5">{formatPrice(product.salePrice)}</span>
                              <span className="text-muted text-decoration-line-through ms-2">
                                {formatPrice(product.price)}
                              </span>
                              <span className="badge bg-danger ms-2">
                                -{Math.round((1 - product.salePrice / product.price) * 100)}%
                              </span>
                            </>
                          ) : (
                            <span className="text-primary fw-bold fs-5">{formatPrice(product.price)}</span>
                          )}
                        </div>
                        <div className="d-grid gap-2">
                          <Link
                            to={`/products/${product.slug || product.id}`}
                            className="btn btn-primary btn-sm"
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

            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 0}>
                      Trước
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(i)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages - 1}>
                      Sau
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products
