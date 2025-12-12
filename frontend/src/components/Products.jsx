import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import { productService } from '../services/productService'
import { categoryService } from '../services/categoryService'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  
  // State cho bộ lọc & sắp xếp
  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: '',
    minPrice: '',
    maxPrice: ''
  })
  
  // State cho sắp xếp (Mặc định: Mới nhất)
  const [sortOption, setSortOption] = useState('newest')

  useEffect(() => {
    loadCategories()
  }, [])

  // Load lại khi page, category hoặc sortOption thay đổi
  useEffect(() => {
    loadProducts()
  }, [page, filters.categoryId, sortOption]) // Khi sortOption đổi -> useEffect chạy -> loadProducts chạy

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories()
      setCategories(data || [])
    } catch (error) {
      console.error('Lỗi tải danh mục:', error)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      
      // === LOGIC QUAN TRỌNG: Mapping Sort Option ===
      // Chuyển đổi lựa chọn từ Dropdown thành tham số API
      let sortBy = 'createdAt'
      let sortDir = 'DESC'

      switch (sortOption) {
        case 'price_asc':
          sortBy = 'currentPrice' // Sắp xếp theo trường ảo @Formula bên Backend
          sortDir = 'ASC'
          break
        case 'price_desc':
          sortBy = 'currentPrice' // Sắp xếp theo trường ảo @Formula bên Backend
          sortDir = 'DESC'
          break
        case 'name_asc':
          sortBy = 'name'
          sortDir = 'ASC'
          break
        case 'newest':
        default:
          sortBy = 'createdAt'
          sortDir = 'DESC'
          break
      }

      // Gọi API Search với các tham số
      const response = await productService.searchProducts({
        keyword: filters.keyword,
        categoryId: filters.categoryId,
        minPrice: filters.minPrice || null,
        maxPrice: filters.maxPrice || null
      }, page, 12, sortBy, sortDir) // Truyền sortBy, sortDir vào đây
      
      setProducts(response.content || [])
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // ... (Giữ nguyên các hàm handleFilterChange, handleApplyPrice, v.v.) ...
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyPrice = () => {
    setPage(0)
    loadProducts()
  }

  const handleSearchKeyword = () => {
    setPage(0)
    loadProducts()
  }

  const handleCategorySelect = (catId) => {
    setFilters(prev => ({ ...prev, categoryId: catId }))
    setPage(0)
  }

  const handleResetFilters = () => {
    setFilters({ keyword: '', categoryId: '', minPrice: '', maxPrice: '' })
    setSortOption('newest')
    setPage(0)
    setTimeout(() => loadProducts(), 100)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <div className="row">
          {/* === SIDEBAR BỘ LỌC (Giữ nguyên) === */}
          <div className="col-lg-3 mb-4">
            <div className="card shadow-sm border-0 sticky-top" style={{ top: '80px', zIndex: 1 }}>
              <div className="card-header bg-white fw-bold">
                <i className="fas fa-filter me-2 text-primary"></i>Bộ lọc tìm kiếm
              </div>
              <div className="card-body">
                {/* 1. Tìm kiếm */}
                <div className="mb-4">
                  <label className="form-label fw-bold small">Từ khóa</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Tên sản phẩm..."
                      name="keyword"
                      value={filters.keyword}
                      onChange={handleFilterChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchKeyword()}
                    />
                    <button className="btn btn-primary btn-sm" onClick={handleSearchKeyword}>
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>

                {/* 2. Danh mục */}
                <div className="mb-4">
                  <label className="form-label fw-bold small">Danh mục</label>
                  <div className="list-group list-group-flush border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <button
                      className={`list-group-item list-group-item-action ${filters.categoryId === '' ? 'active' : ''}`}
                      onClick={() => handleCategorySelect('')}
                    >
                      Tất cả
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${filters.categoryId == cat.id ? 'active' : ''}`}
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Khoảng giá */}
                <div className="mb-3">
                  <label className="form-label fw-bold small">Khoảng giá</label>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Từ"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      min="0"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Đến"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      min="0"
                    />
                  </div>
                  <button className="btn btn-outline-primary btn-sm w-100" onClick={handleApplyPrice}>
                    Áp dụng
                  </button>
                </div>

                {/* Nút Reset */}
                <button className="btn btn-light btn-sm w-100 mt-2 text-danger" onClick={handleResetFilters}>
                  <i className="fas fa-undo me-1"></i>Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* === DANH SÁCH SẢN PHẨM === */}
          <div className="col-lg-9">
            {/* Header danh sách: Tiêu đề + Sort */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
              <div className="mb-2 mb-md-0">
                <h2 className="fs-5 mb-0 d-inline-block me-2">
                  <i className="fas fa-box me-2 text-primary"></i>Danh sách sản phẩm
                </h2>
                <span className="badge bg-secondary rounded-pill">{totalElements} sản phẩm</span>
              </div>
              
              <div className="d-flex align-items-center">
                <label className="me-2 small text-muted text-nowrap">Sắp xếp theo:</label>
                {/* Dropdown thay đổi sortOption */}
                <select 
                  className="form-select form-select-sm" 
                  style={{ width: '200px' }}
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value)
                    setPage(0) // Reset về trang 1 khi đổi sort
                  }}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="name_asc">Tên: A - Z</option>
                </select>
              </div>
            </div>

            {/* ... (Phần hiển thị danh sách sản phẩm giữ nguyên) ... */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="alert alert-info text-center py-5 shadow-sm">
                <i className="fas fa-search fa-3x mb-3 text-muted opacity-50"></i>
                <h5>Không tìm thấy sản phẩm nào</h5>
                <p className="text-muted">Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button className="btn btn-primary btn-sm" onClick={handleResetFilters}>
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              <>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                  {products.map((product) => (
                    <div key={product.id} className="col">
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
                                <span className="position-absolute top-0 start-0 badge bg-danger m-2 shadow-sm">
                                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                                </span>
                            )}
                        </div>
                        
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title fs-6 mb-1">
                            <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark fw-bold product-title">
                              {product.name}
                            </Link>
                          </h5>
                          
                          <div className="mt-auto pt-3">
                            <div className="mb-3">
                              {product.salePrice ? (
                                <div className="d-flex align-items-baseline">
                                  <span className="text-danger fw-bold fs-5 me-2">{formatPrice(product.salePrice)}</span>
                                  <span className="text-muted text-decoration-line-through small">
                                    {formatPrice(product.price)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-primary fw-bold fs-5">{formatPrice(product.price)}</span>
                              )}
                            </div>
                            
                            <div className="d-grid">
                              <Link
                                to={`/products/${product.slug || product.id}`}
                                className="btn btn-outline-primary btn-sm rounded-pill"
                              >
                                <i className="fas fa-eye me-1"></i>Xem chi tiết
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <nav aria-label="Page navigation" className="mt-5">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                        <button className="page-link rounded-start-pill" onClick={() => setPage(page - 1)} disabled={page === 0}>
                          <i className="fas fa-chevron-left me-1"></i> Trước
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
                        <button className="page-link rounded-end-pill" onClick={() => setPage(page + 1)} disabled={page === totalPages - 1}>
                          Sau <i className="fas fa-chevron-right ms-1"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products