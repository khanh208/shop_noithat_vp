// File: frontend/src/components/Profile.jsx
import React, { useState, useEffect } from 'react'
import Navigation from './Navigation'
import { userService } from '../services/userService'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    email: '' // Read only
  })

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
        email: data.email
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updatedUser = await userService.updateProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      })
      setUser(updatedUser)
      setIsEditing(false)
      alert('Cập nhật hồ sơ thành công!')
    } catch (error) {
      alert('Lỗi cập nhật: ' + error.message)
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <h2 className="mb-4"><i className="fas fa-user-edit me-2"></i>Hồ sơ cá nhân</h2>
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card text-center p-4">
                <div className="mb-3">
                    <img src="https://placehold.co/150" className="rounded-circle" alt="Avatar"/>
                </div>
                <h4>{user.username}</h4>
                <p className="text-muted">{user.role}</p>
                <div className="d-grid">
                    {!isEditing && (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            <i className="fas fa-pen me-2"></i>Chỉnh sửa thông tin
                        </button>
                    )}
                </div>
            </div>
          </div>
          
          <div className="col-md-8">
            <div className="card">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Thông tin chi tiết</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Email</label>
                            <input type="text" className="form-control" value={formData.email} disabled />
                            <small className="text-muted">Email không thể thay đổi</small>
                        </div>
                        <div className="mb-3">
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
                        <div className="mb-3">
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
                        <div className="mb-3">
                            <label className="form-label fw-bold">Địa chỉ mặc định</label>
                            <textarea 
                                className="form-control" 
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                rows="3"
                            ></textarea>
                        </div>

                        {isEditing && (
                            <div className="d-flex gap-2 justify-content-end">
                                <button type="button" className="btn btn-secondary" onClick={() => {
                                    setIsEditing(false)
                                    loadProfile() // Reset data
                                }}>Hủy</button>
                                <button type="submit" className="btn btn-success">Lưu thay đổi</button>
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