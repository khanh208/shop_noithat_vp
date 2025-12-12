// File: frontend/src/components/admin/AdminBannerForm.jsx

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminBannerForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    link: '',
    position: 'SLIDER',
    displayOrder: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  })
  
  // State quản lý file upload
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      loadBanner()
    }
  }, [id])

  const loadBanner = async () => {
    try {
      const data = await adminService.getBannerById(id)
      setFormData({
        ...data,
        startDate: data.startDate ? data.startDate.substring(0, 16) : '',
        endDate: data.endDate ? data.endDate.substring(0, 16) : ''
      })
      // Nếu có ảnh cũ, hiển thị preview
      if (data.imageUrl) {
        setPreviewUrl(data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:8082${data.imageUrl}`)
      }
    } catch (error) {
      alert('Lỗi tải thông tin banner')
    }
  }

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Tạo URL preview tạm thời
      setPreviewUrl(URL.createObjectURL(file))
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
    setLoading(true)
    try {
      let finalImageUrl = formData.imageUrl;

      // 1. Nếu có chọn file mới -> Upload trước
      if (selectedFile) {
        const uploadRes = await adminService.uploadImage(selectedFile)
        finalImageUrl = uploadRes.url
      }

      // 2. Gửi dữ liệu banner (kèm URL ảnh mới hoặc cũ)
      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      }

      if (isEdit) {
        await adminService.updateBanner(id, payload)
        alert('Cập nhật thành công!')
      } else {
        await adminService.createBanner(payload)
        alert('Thêm mới thành công!')
      }
      navigate('/admin/banners')
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{isEdit ? 'Cập Nhật Banner' : 'Thêm Banner Mới'}</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/banners')}>Quay lại</button>
        </div>

        <div className="card shadow-sm mx-auto" style={{maxWidth: '800px'}}>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Tiêu đề <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              {/* === PHẦN CHỌN ẢNH === */}
              <div className="mb-3">
                <label className="form-label fw-bold">Hình ảnh <span className="text-danger">*</span></label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*"
                  onChange={handleFileChange} 
                  required={!isEdit && !formData.imageUrl} // Bắt buộc nếu là thêm mới
                />
                
                {/* Hiển thị Preview */}
                {previewUrl && (
                  <div className="mt-2 text-center border rounded p-2 bg-light">
                    <img src={previewUrl} alt="Preview" style={{maxWidth: '100%', maxHeight: '200px', objectFit: 'contain'}} />
                  </div>
                )}
                
                {/* Input ẩn để giữ URL cũ nếu không chọn file mới */}
                <input type="hidden" name="imageUrl" value={formData.imageUrl} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Vị trí hiển thị</label>
                  <select className="form-select" name="position" value={formData.position} onChange={handleChange}>
                    <option value="SLIDER">Slider Trang Chủ</option>
                    <option value="POPUP">Popup (Hiện khi vào trang)</option>
                    <option value="CATEGORY">Trang Danh Mục</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Thứ tự hiển thị</label>
                  <input type="number" className="form-control" name="displayOrder" value={formData.displayOrder} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Link liên kết</label>
                <input type="text" className="form-control" name="link" value={formData.link} onChange={handleChange} placeholder="/products/..." />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Ngày bắt đầu</label>
                  <input type="datetime-local" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Ngày kết thúc</label>
                  <input type="datetime-local" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-4 form-check form-switch">
                <input className="form-check-input" type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
                <label className="form-check-label fw-bold" htmlFor="isActive">Kích hoạt</label>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xử lý (Upload & Lưu)...
                  </>
                ) : (
                  isEdit ? 'Lưu Thay Đổi' : 'Tạo Banner Mới'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBannerForm