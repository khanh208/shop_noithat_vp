import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    price: '',
    salePrice: '',
    description: '',
    shortDescription: '',
    stockQuantity: '',
    brand: '',
    material: '',
    color: '',
    dimensions: '',
    isFeatured: false,
    isActive: true
  })
  
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
    if (isEdit) {
      loadProduct()
    }
  }, [id])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const categoriesData = await adminService.getCategories()
      // Đảm bảo luôn là array
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData)
      } else {
        console.error('Categories response is not an array:', categoriesData)
        setCategories([])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
      setError('Không thể tải danh sách danh mục')
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadProduct = async () => {
    try {
      setLoading(true)
      const product = await adminService.getProductById(id)
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        categoryId: product.category?.id || '',
        price: product.price || '',
        salePrice: product.salePrice || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        stockQuantity: product.stockQuantity || '',
        brand: product.brand || '',
        material: product.material || '',
        color: product.color || '',
        dimensions: product.dimensions || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== undefined ? product.isActive : true
      })
    } catch (error) {
      setError('Không thể tải thông tin sản phẩm')
      console.error('Error loading product:', error)
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
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        categoryId: parseInt(formData.categoryId),
        stockQuantity: parseInt(formData.stockQuantity)
      }

      if (isEdit) {
        await adminService.updateProduct(id, data)
        alert('Cập nhật sản phẩm thành công!')
      } else {
        await adminService.createProduct(data)
        alert('Thêm sản phẩm thành công!')
      }
      
      navigate('/admin/products')
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingCategories) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu...</p>
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
            {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/products')}>
            <i className="fas fa-arrow-left me-2"></i>Quay lại
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Tên sản phẩm <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">SKU <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                      disabled={isEdit}
                    />
                    {isEdit && <small className="text-muted">SKU không thể thay đổi</small>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Danh mục <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                      disabled={loadingCategories}
                    >
                      <option value="">
                        {loadingCategories ? 'Đang tải...' : 'Chọn danh mục'}
                      </option>
                      {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))
                      ) : (
                        !loadingCategories && <option value="" disabled>Không có danh mục nào</option>
                      )}
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Số lượng tồn kho <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Giá <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Giá sale (tùy chọn)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Thương hiệu</label>
                    <input
                      type="text"
                      className="form-control"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Chất liệu</label>
                    <input
                      type="text"
                      className="form-control"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Màu sắc</label>
                    <input
                      type="text"
                      className="form-control"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Kích thước</label>
                    <input
                      type="text"
                      className="form-control"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      placeholder="VD: 120x60x75 cm"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Mô tả ngắn</label>
                <textarea
                  className="form-control"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows="2"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Mô tả chi tiết</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">
                      Sản phẩm nổi bật
                    </label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">
                      Hiển thị trên trang người dùng
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/products')}
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
                      <i className={`fas fa-${isEdit ? 'save' : 'plus'} me-2`}></i>
                      {isEdit ? 'Cập nhật' : 'Thêm mới'}
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

export default AdminProductForm

