import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from './Navigation'
import { cartService } from '../services/cartService'
import { orderService } from '../services/orderService'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // State cho địa chỉ
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerPhone: user?.phoneNumber || '',
    customerEmail: user?.email || '',
    shippingAddress: '',
    shippingProvince: '',
    shippingDistrict: '',
    shippingWard: '',
    paymentMethod: 'COD',
    voucherCode: '',
    notes: ''
  })

  useEffect(() => {
    loadCart()
    fetchProvinces()
  }, [])

  const loadCart = async () => {
    try {
      const items = await cartService.getCart()
      if (items.length === 0) {
        alert('Giỏ hàng trống!')
        navigate('/products')
        return
      }
      setCartItems(items)
      const sum = items.reduce((acc, item) => {
        const price = item.product.salePrice || item.product.price
        return acc + (price * item.quantity)
      }, 0)
      setTotal(sum)
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error)
    } finally {
      setLoading(false)
    }
  }

  // === DÙNG API provinces.open-api.vn (Ổn định, không lỗi CORS/404) ===
  const fetchProvinces = async () => {
    try {
      const response = await axios.get('https://provinces.open-api.vn/api/p/')
      setProvinces(response.data)
    } catch (error) {
      console.error('Lỗi tải tỉnh thành:', error)
    }
  }

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      setDistricts(response.data.districts)
      setWards([]) 
    } catch (error) {
      console.error('Lỗi tải quận huyện:', error)
    }
  }

  const fetchWards = async (districtCode) => {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      setWards(response.data.wards)
    } catch (error) {
      console.error('Lỗi tải phường xã:', error)
    }
  }

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value
    const provinceName = e.target.options[e.target.selectedIndex].text
    
    setFormData({
      ...formData,
      shippingProvince: provinceName,
      shippingDistrict: '',
      shippingWard: ''
    })
    
    fetchDistricts(provinceCode)
  }

  const handleDistrictChange = (e) => {
    const districtCode = e.target.value
    const districtName = e.target.options[e.target.selectedIndex].text
    
    setFormData({
      ...formData,
      shippingDistrict: districtName,
      shippingWard: ''
    })
    
    fetchWards(districtCode)
  }

  const handleWardChange = (e) => {
    const wardName = e.target.options[e.target.selectedIndex].text
    setFormData({
      ...formData,
      shippingWard: wardName
    })
  }
  // ==========================================================

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      await orderService.createOrder(formData)
      if (formData.paymentMethod === 'MOMO') {
        alert('Chức năng thanh toán MoMo đang phát triển. Đơn hàng đã được tạo với trạng thái Chờ thanh toán.')
      } else {
        alert('Đặt hàng thành công!')
      }
      navigate('/orders')
    } catch (error) {
      console.error('Lỗi đặt hàng:', error)
      alert('Đặt hàng thất bại: ' + (error.response?.data?.message || error.message))
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <h2 className="mb-4"><i className="fas fa-money-check-alt me-2"></i>Thanh toán</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-7">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Thông tin giao hàng</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Họ và tên <span className="text-danger">*</span></label>
                    <input type="text" name="customerName" className="form-control" required 
                           value={formData.customerName} onChange={handleChange} />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                      <input type="tel" name="customerPhone" className="form-control" required 
                             value={formData.customerPhone} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email <span className="text-danger">*</span></label>
                      <input type="email" name="customerEmail" className="form-control" required 
                             value={formData.customerEmail} onChange={handleChange} />
                    </div>
                  </div>

                  {/* === DROP-DOWN ĐỊA CHỈ (Dùng code thay vì id) === */}
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Tỉnh/Thành <span className="text-danger">*</span></label>
                      <select className="form-select" required onChange={handleProvinceChange} defaultValue="">
                        <option value="" disabled>Chọn Tỉnh/Thành</option>
                        {provinces.map(prov => (
                          <option key={prov.code} value={prov.code}>{prov.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Quận/Huyện <span className="text-danger">*</span></label>
                      <select className="form-select" required onChange={handleDistrictChange} defaultValue="" disabled={!districts.length}>
                        <option value="" disabled>Chọn Quận/Huyện</option>
                        {districts.map(dist => (
                          <option key={dist.code} value={dist.code}>{dist.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Phường/Xã <span className="text-danger">*</span></label>
                      <select className="form-select" required onChange={handleWardChange} defaultValue="" disabled={!wards.length}>
                        <option value="" disabled>Chọn Phường/Xã</option>
                        {wards.map(ward => (
                          <option key={ward.code} value={ward.code}>{ward.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* ============================================================== */}
                  
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ chi tiết <span className="text-danger">*</span></label>
                    <input type="text" name="shippingAddress" className="form-control" required 
                           placeholder="Số nhà, tên đường..."
                           value={formData.shippingAddress} onChange={handleChange} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Ghi chú đơn hàng</label>
                    <textarea name="notes" className="form-control" rows="2" 
                              value={formData.notes} onChange={handleChange}></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Đơn hàng của bạn</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush mb-3">
                    {cartItems.map(item => (
                      <li key={item.id} className="list-group-item d-flex justify-content-between lh-sm">
                        <div>
                          <h6 className="my-0">{item.product.name}</h6>
                          <small className="text-muted">SL: {item.quantity}</small>
                        </div>
                        <span className="text-muted">
                          {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                        </span>
                      </li>
                    ))}
                    <li className="list-group-item d-flex justify-content-between fw-bold">
                      <span>Tổng cộng (chưa ship)</span>
                      <span className="text-danger">{formatPrice(total)}</span>
                    </li>
                  </ul>

                  <h6 className="mb-3">Phương thức thanh toán</h6>
                  <div className="mb-3">
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="radio" name="paymentMethod" 
                             id="paymentCOD" value="COD" 
                             checked={formData.paymentMethod === 'COD'} onChange={handleChange} />
                      <label className="form-check-label" htmlFor="paymentCOD">
                        Thanh toán khi nhận hàng (COD)
                      </label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="paymentMethod" 
                             id="paymentMOMO" value="MOMO" 
                             checked={formData.paymentMethod === 'MOMO'} onChange={handleChange} />
                      <label className="form-check-label text-pink" htmlFor="paymentMOMO">
                        Thanh toán qua Ví MoMo
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success w-100 btn-lg" disabled={processing}>
                    {processing ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout