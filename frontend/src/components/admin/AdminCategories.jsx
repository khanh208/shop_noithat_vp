import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await adminService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      alert('Lỗi khi tải danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await adminService.deleteCategory(id)
        alert('Xóa danh mục thành công!')
        loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Lỗi khi xóa danh mục: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="fas fa-tags me-2"></i>
            Quản lý Danh mục
          </h2>
          <div>
            <Link to="/admin/categories/new" className="btn btn-primary me-2">
              <i className="fas fa-plus me-2"></i>Thêm danh mục
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
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Tên danh mục</th>
                      <th>Slug</th>
                      <th>Mô tả</th>
                      <th>Thứ tự</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td className="fw-bold">{category.name}</td>
                          <td><code>{category.slug}</code></td>
                          <td>{category.description || '-'}</td>
                          <td>{category.displayOrder}</td>
                          <td>
                            {category.isActive ? (
                              <span className="badge bg-success">Hoạt động</span>
                            ) : (
                              <span className="badge bg-secondary">Ẩn</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              <Link
                                to={`/admin/categories/${category.id}/edit`}
                                className="btn btn-sm btn-outline-primary"
                                title="Sửa"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(category.id)}
                                title="Xóa"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                          Chưa có danh mục nào. Hãy thêm mới!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategories