import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminBanners = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllBanners()
      setBanners(data)
    } catch (error) {
      console.error('Error loading banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa banner này?')) {
      try {
        await adminService.deleteBanner(id)
        loadBanners() // Reload list
      } catch (error) {
        alert('Lỗi xóa banner')
      }
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2><i className="fas fa-images me-2"></i>Quản lý Banner Quảng Cáo</h2>
          <div>
            <Link to="/admin/banners/new" className="btn btn-primary me-2">
              <i className="fas fa-plus me-2"></i>Thêm Banner
            </Link>
            <Link to="/admin" className="btn btn-secondary">Về Dashboard</Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Ảnh</th>
                    <th>Tiêu đề</th>
                    <th>Vị trí</th>
                    <th>Thứ tự</th>
                    <th>Trạng thái</th>
                    <th>Thời hạn</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.length > 0 ? banners.map(banner => (
                    <tr key={banner.id}>
                      <td style={{width: '120px'}}>
                        <img src={banner.imageUrl} alt="" className="img-thumbnail" style={{height: '60px', objectFit: 'cover'}} />
                      </td>
                      <td className="fw-bold">{banner.title}</td>
                      <td><span className="badge bg-info text-dark">{banner.position}</span></td>
                      <td className="text-center">{banner.displayOrder}</td>
                      <td>
                        {banner.isActive 
                          ? <span className="badge bg-success">Hiển thị</span> 
                          : <span className="badge bg-secondary">Ẩn</span>}
                      </td>
                      <td className="small text-muted">
                        <div>Bắt đầu: {banner.startDate ? new Date(banner.startDate).toLocaleDateString('vi-VN') : '-'}</div>
                        <div>Kết thúc: {banner.endDate ? new Date(banner.endDate).toLocaleDateString('vi-VN') : '-'}</div>
                      </td>
                      <td>
                        <Link to={`/admin/banners/${banner.id}/edit`} className="btn btn-sm btn-outline-primary me-2">
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(banner.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="text-center py-4">Chưa có banner nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBanners