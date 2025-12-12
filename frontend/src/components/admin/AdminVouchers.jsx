import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVouchers()
  }, [])

  const loadVouchers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllVouchers()
      setVouchers(data)
    } catch (error) {
      console.error('Error loading vouchers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
      try {
        await adminService.deleteVoucher(id)
        alert('Xóa thành công!')
        loadVouchers()
      } catch (error) {
        alert('Lỗi xóa voucher: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN')

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2><i className="fas fa-ticket-alt me-2"></i>Quản lý Voucher</h2>
          <div>
            <Link to="/admin/vouchers/new" className="btn btn-primary me-2">
              <i className="fas fa-plus me-2"></i>Thêm Voucher
            </Link>
            <Link to="/admin" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-left me-2"></i>Về Dashboard
            </Link>
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
                    <th>Mã Code</th>
                    <th>Tên chương trình</th>
                    <th>Giảm giá</th>
                    <th>Điều kiện</th>
                    <th>Thời hạn</th>
                    <th>Lượt dùng</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.length > 0 ? vouchers.map(v => (
                    <tr key={v.id}>
                      <td><span className="badge bg-primary fs-6">{v.code}</span></td>
                      <td>{v.name}</td>
                      <td className="fw-bold text-danger">
                        {v.discountType === 'PERCENTAGE' 
                          ? `${v.discountValue}% (Tối đa ${formatPrice(v.maxDiscountAmount || 0)})` 
                          : formatPrice(v.discountValue)}
                      </td>
                      <td className="small">Min: {formatPrice(v.minOrderAmount || 0)}</td>
                      <td className="small">
                        <div>Từ: {formatDate(v.startDate)}</div>
                        <div>Đến: {formatDate(v.endDate)}</div>
                      </td>
                      <td>{v.usedCount} / {v.usageLimit}</td>
                      <td>
                        {v.isActive 
                          ? <span className="badge bg-success">Kích hoạt</span> 
                          : <span className="badge bg-secondary">Khóa</span>}
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/admin/vouchers/${v.id}/edit`} className="btn btn-sm btn-outline-warning">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(v.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="8" className="text-center py-4">Chưa có voucher nào</td></tr>
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

export default AdminVouchers