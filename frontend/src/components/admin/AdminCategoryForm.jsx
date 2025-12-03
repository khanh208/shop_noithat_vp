import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminCategoryForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadCategory()
    }
  }, [id])

  const loadCategory = async () => {
    try {
      setLoading(true)
      const category = await adminService.getCategoryById(id)
      setFormData({
        name: category.name || '',
        description: category.description || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive ?? true
      })
    } catch (error) {
      setError('Không thể tải thông tin danh mục')
      console.error('Error loading category:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const data = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0
      }

      if (isEdit) {
        await adminService.updateCategory(id, data)
        alert('Cập nhật danh mục thành công!')
      } else {
        await adminService.createCategory(data)
        alert('Thêm danh mục thành công!')
      }
      navigate('/admin/categories')
    } catch (error) {
      console.error('Submit error:', error)
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục')
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className={`fas fa-${isEdit ? 'edit' : 'plus'} me-2`}></i>
            {isEdit ? 'Cập nhật Danh mục' : 'Thêm Danh mục Mới'}
          </h2>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/categories')}>
            <i className="fas fa-arrow-left me-2"></i>Quay lại
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <div className="card shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Tên danh mục <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên danh mục (VD: Bàn làm việc)"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Mô tả</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Mô tả ngắn về danh mục này"
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    className="form-control"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    min="0"
                  />
                  <small className="text-muted">Số nhỏ hơn sẽ hiển thị trước</small>
                </div>
                
                <div className="col-md-6 mb-3 d-flex align-items-center">
                  <div className="form-check form-switch mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label ms-2" htmlFor="isActive">
                      Kích hoạt (Hiển thị)
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                <button
                  type="button"
                  className="btn btn-secondary me-md-2"
                  onClick={() => navigate('/admin/categories')}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Lưu lại
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCategoryForm