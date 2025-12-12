import React, { useState, useEffect } from 'react'
import Navigation from './Navigation'
import { userService } from '../services/userService'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false) // State cho trạng thái upload
  
  // State quản lý form
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    email: '',
    avatarUrl: ''
  })

  // State quản lý file ảnh
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile()
      setUser(data)
      setFormData({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        email: data.email,
        avatarUrl: data.avatarUrl || ''
      })
      
      // Xử lý hiển thị ảnh cũ
      if (data.avatarUrl) {
        setPreviewUrl(data.avatarUrl.startsWith('http') 
          ? data.avatarUrl 
          : `http://localhost:8082${data.avatarUrl}`)
      } else {
        setPreviewUrl('https://placehold.co/150?text=Avatar')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Xử lý khi chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Tạo URL preview tạm thời
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      let finalAvatarUrl = formData.avatarUrl

      // 1. Nếu có chọn file mới -> Upload trước
      if (selectedFile) {
        const uploadRes = await userService.uploadAvatar(selectedFile)
        finalAvatarUrl = uploadRes.url
      }

      // 2. Cập nhật thông tin profile kèm URL ảnh mới
      const updatedUser = await userService.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        avatarUrl: finalAvatarUrl
      })

      setUser(updatedUser)
      setIsEditing(false)
      setSelectedFile(null) // Reset file đã chọn
      alert('Cập nhật hồ sơ thành công!')
    } catch (error) {
      console.error('Lỗi cập nhật:', error)
      alert('Lỗi cập nhật: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <h2 className="mb-4"><i className="fas fa-user-edit me-2"></i>Hồ sơ cá nhân</h2>
        
        <div className="row">
          {/* CỘT TRÁI: AVATAR & THÔNG TIN CƠ BẢN */}
          <div className="col-md-4 mb-4">
            <div className="card text-center p-4 h-100 shadow-sm">
                <div className="position-relative d-inline-block mx-auto mb-3">
                    <img 
                      src={previewUrl} 
                      className="rounded-circle border border-3 border-light shadow-sm" 
                      alt="Avatar"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = "https://placehold.co/150?text=Error" }}
                    />
                    
                    {/* Nút thay đổi ảnh chỉ hiện khi đang Edit */}
                    {isEditing && (
                      <label 
                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow"
                        style={{ cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Đổi ảnh đại diện"
                      >
                        <i className="fas fa-camera"></i>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="d-none" 
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                </div>
                
                <h4>{user?.username}</h4>
                <p className="text-muted text-uppercase small fw-bold">{user?.role}</p>
                
                <div className="d-grid mt-auto">
                    {!isEditing && (
                        <button className="btn btn-outline-primary" onClick={() => setIsEditing(true)}>
                            <i className="fas fa-pen me-2"></i>Chỉnh sửa thông tin
                        </button>
                    )}
                </div>
            </div>
          </div>
          
          {/* CỘT PHẢI: FORM THÔNG TIN */}
          <div className="col-md-8">
            <div className="card shadow-sm h-100">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 text-primary">Thông tin chi tiết</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label text-muted small text-uppercase fw-bold">Email</label>
                            <input type="text" className="form-control bg-light" value={formData.email} disabled />
                        </div>
                        
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Họ và tên</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Số điện thoại</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Địa chỉ</label>
                            <textarea 
                                className="form-control" 
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                rows="3"
                                placeholder="Nhập địa chỉ mặc định..."
                            ></textarea>
                        </div>

                        {isEditing && (
                            <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                                <button 
                                  type="button" 
                                  className="btn btn-secondary px-4" 
                                  onClick={() => {
                                    setIsEditing(false)
                                    setSelectedFile(null)
                                    loadProfile() // Reset data về ban đầu
                                  }}
                                  disabled={uploading}
                                >
                                  Hủy
                                </button>
                                <button 
                                  type="submit" 
                                  className="btn btn-success px-4"
                                  disabled={uploading}
                                >
                                  {uploading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                      Đang lưu...
                                    </>
                                  ) : (
                                    <><i className="fas fa-save me-2"></i>Lưu thay đổi</>
                                  )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile