import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadProducts()
  }, [page])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllProducts(page, 20)
      setProducts(response.content || [])
      setTotalPages(response.totalPages || 0)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này? Sản phẩm sẽ không hiển thị trên trang người dùng.')) {
      try {
        await adminService.deleteProduct(productId)
        alert('Xóa sản phẩm thành công!')
        await loadProducts()
      } catch (error) {
        alert('Lỗi khi xóa sản phẩm: ' + (error.response?.data?.message || error.message))
        console.error('Error deleting product:', error)
      }
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="fas fa-box me-2"></i>
            Quản lý sản phẩm
          </h2>
          <div>
            <Link to="/admin/products/new" className="btn btn-primary me-2">
              <i className="fas fa-plus me-2"></i>Thêm sản phẩm
            </Link>
            <Link to="/admin" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-left me-2"></i>Về Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Tên sản phẩm</th>
                    <th>SKU</th>
                    <th>Giá</th>
                    <th>Giá sale</th>
                    <th>Tồn kho</th>
                    <th>Danh mục</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        <strong>{product.name}</strong>
                        {product.isFeatured && (
                          <span className="badge bg-warning ms-2">Nổi bật</span>
                        )}
                      </td>
                      <td>{product.sku}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        {product.salePrice ? (
                          <span className="text-danger">{formatPrice(product.salePrice)}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className={product.stockQuantity > 10 ? 'text-success' : 'text-danger'}>
                          {product.stockQuantity}
                        </span>
                      </td>
                      <td>{product.category?.name || '-'}</td>
                      <td>
                        {product.isActive ? (
                          <span className="badge bg-success">Hoạt động</span>
                        ) : (
                          <span className="badge bg-secondary">Tạm dừng</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link
                            to={`/products/${product.slug || product.id}`}
                            className="btn btn-sm btn-outline-primary"
                            target="_blank"
                            title="Xem"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="btn btn-sm btn-outline-warning"
                            title="Sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(product.id)}
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default AdminProducts

