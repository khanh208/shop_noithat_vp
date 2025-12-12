import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminVoucherForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE', // PERCENTAGE hoặc FIXED_AMOUNT
    discountValue: '',
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 100,
    startDate: '',
    endDate: '',
    isActive: true
  })
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) loadVoucher()
  }, [id])

  const loadVoucher = async () => {
    try {
      const data = await adminService.getVoucherById(id)
      // Format lại ngày giờ cho input datetime-local (yyyy-MM-ddThh:mm)
      const formatDateTime = (isoString) => isoString ? isoString.substring(0, 16) : ''
      
      setFormData({
        ...data,
        startDate: formatDateTime(data.startDate),
        endDate: formatDateTime(data.endDate)
      })
    } catch (error) {
      alert('Lỗi tải thông tin voucher')
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
      if (isEdit) {
        await adminService.updateVoucher(id, formData)
        alert('Cập nhật thành công!')
      } else {
        await adminService.createVoucher(formData)
        alert('Tạo voucher thành công!')
      }
      navigate('/admin/vouchers')
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{isEdit ? 'Cập nhật Voucher' : 'Tạo Voucher Mới'}</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/vouchers')}>Quay lại</button>
        </div>

        <div className="card shadow-sm mx-auto" style={{maxWidth: '800px'}}>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Mã Voucher (Code) <span className="text-danger">*</span></label>
                  <input type="text" className="form-control text-uppercase" name="code" 
                         value={formData.code} onChange={handleChange} required placeholder="VD: SALE50" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Tên chương trình <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="name" 
                         value={formData.name} onChange={handleChange} required placeholder="VD: Siêu sale tháng 5" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Mô tả</label>
                <textarea className="form-control" name="description" rows="2" 
                          value={formData.description} onChange={handleChange}></textarea>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Loại giảm giá</label>
                  <select className="form-select" name="discountType" value={formData.discountType} onChange={handleChange}>
                    <option value="PERCENTAGE">Theo Phần Trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số Tiền Cố Định (VNĐ)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Giá trị giảm <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" name="discountValue" 
                         value={formData.discountValue} onChange={handleChange} required min="0" />
                  <div className="form-text">Nhập số % hoặc số tiền VNĐ tùy loại giảm giá</div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Đơn tối thiểu (VNĐ)</label>
                  <input type="number" className="form-control" name="minOrderAmount" 
                         value={formData.minOrderAmount} onChange={handleChange} min="0" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Giảm tối đa (VNĐ)</label>
                  <input type="number" className="form-control" name="maxDiscountAmount" 
                         value={formData.maxDiscountAmount} onChange={handleChange} min="0" 
                         disabled={formData.discountType === 'FIXED_AMOUNT'} />
                  {formData.discountType === 'FIXED_AMOUNT' && <div className="form-text">Không áp dụng cho giảm tiền cố định</div>}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Số lượng phát hành</label>
                  <input type="number" className="form-control" name="usageLimit" 
                         value={formData.usageLimit} onChange={handleChange} required min="1" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Ngày bắt đầu</label>
                  <input type="datetime-local" className="form-control" name="startDate" 
                         value={formData.startDate} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Ngày kết thúc</label>
                  <input type="datetime-local" className="form-control" name="endDate" 
                         value={formData.endDate} onChange={handleChange} required />
                </div>
              </div>

              <div className="mb-3 form-check form-switch">
                <input className="form-check-input" type="checkbox" id="isActive" name="isActive" 
                       checked={formData.isActive} onChange={handleChange} />
                <label className="form-check-label fw-bold" htmlFor="isActive">Kích hoạt ngay</label>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Đang lưu...' : (isEdit ? 'Cập Nhật Voucher' : 'Tạo Voucher Mới')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminVoucherForm