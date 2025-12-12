import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from './Navigation'
import { cartService } from '../services/cartService'
import { orderService } from '../services/orderService'
import { userService } from '../services/userService'
import { useAuth } from '../context/AuthContext'
import { voucherService } from '../services/voucherService' // Đảm bảo đã import
import axios from 'axios'

const Checkout = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  
  // SỬA: Dùng subTotal để lưu tạm tính, total sẽ được tính toán động
  const [subTotal, setSubTotal] = useState(0) 
  
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)

  // --- STATE VOUCHER ---
  const [voucherCodeInput, setVoucherCodeInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null) // { code, discountAmount }
  const [voucherError, setVoucherError] = useState('')
  const [checkingVoucher, setCheckingVoucher] = useState(false)

  // State cho địa chỉ
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  const shippingFee = 30000;
  
  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerPhone: user?.phoneNumber || '',
    customerEmail: user?.email || '',
    shippingAddress: '',
    shippingProvince: '',
    shippingDistrict: '',
    shippingWard: '',
    paymentMethod: 'COD',
    notes: ''
  })

  useEffect(() => {
    loadCart()
    fetchProvinces()
    fetchWalletBalance()
  }, [])

  const fetchWalletBalance = async () => {
    try {
      const profile = await userService.getProfile()
      setWalletBalance(profile.balance || 0)
    } catch (error) {
      console.error('Lỗi tải số dư ví:', error)
      setWalletBalance(0)
    }
  }

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
      // SỬA: Lưu vào subTotal (Tạm tính)
      setSubTotal(sum) 
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- HÀM XỬ LÝ VOUCHER ---
  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;

    setCheckingVoucher(true)
    setVoucherError('')
    setAppliedVoucher(null)

    try {
      // Gọi API kiểm tra voucher với tổng tiền tạm tính (subTotal)
      const result = await voucherService.checkVoucher(voucherCodeInput, subTotal)
      
      setAppliedVoucher({
        code: result.voucherCode,
        discountAmount: result.discountAmount
      })
      alert(`Áp dụng thành công! Giảm: ${formatPrice(result.discountAmount)}`)
    } catch (error) {
      setVoucherError(error.response?.data?.message || 'Mã giảm giá không hợp lệ')
    } finally {
      setCheckingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCodeInput('')
    setVoucherError('')
  }

  // --- TÍNH TOÁN TỔNG TIỀN CUỐI CÙNG ---
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0
  const finalTotal = Math.max(0, subTotal + shippingFee - discountAmount)

  // === API provinces.open-api.vn ===
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      // SỬA: Kiểm tra số dư với finalTotal (sau khi trừ voucher)
      if (formData.paymentMethod === 'WALLET' && walletBalance < finalTotal) {
        alert('Số dư ví không đủ! Vui lòng nạp thêm tiền hoặc chọn phương thức thanh toán khác.')
        setProcessing(false)
        return
      }

      // 1. Tạo đơn hàng (Kèm mã voucher)
      const orderPayload = {
        ...formData,
        voucherCode: appliedVoucher ? appliedVoucher.code : null
      }

      const orderData = await orderService.createOrder(orderPayload)
      
      if (formData.paymentMethod === 'MOMO') {
        // 2. Nếu chọn MoMo -> Gọi API lấy link thanh toán
        try {
          const response = await axios.post(`http://localhost:8082/api/payment/create-momo/${orderData.id}`)
          
          if (response.data && response.data.payUrl) {
            window.location.href = response.data.payUrl
          } else {
            alert('Lỗi: Không nhận được link thanh toán từ MoMo.')
            navigate('/orders')
          }
        } catch (momoError) {
          console.error('Lỗi MoMo:', momoError)
          alert('Tạo đơn hàng thành công nhưng lỗi kết nối MoMo. Vui lòng thanh toán lại trong đơn hàng.')
          navigate('/orders')
        }
      } else if (formData.paymentMethod === 'WALLET') {
        alert('Thanh toán thành công từ ví cá nhân!')
        navigate('/orders')
      } else {
        // COD
        alert('Đặt hàng thành công! Vui lòng thanh toán khi nhận hàng.')
        navigate('/orders')
      }
      
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
                  </ul>

                  {/* === PHẦN VOUCHER (MỚI THÊM) === */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Mã giảm giá</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nhập mã voucher"
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                        disabled={appliedVoucher || checkingVoucher}
                      />
                      {appliedVoucher ? (
                        <button className="btn btn-danger" type="button" onClick={handleRemoveVoucher}>
                          <i className="fas fa-times"></i> Xóa
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline-primary" 
                          type="button" 
                          onClick={handleApplyVoucher}
                          disabled={!voucherCodeInput || checkingVoucher}
                        >
                          {checkingVoucher ? '...' : 'Áp dụng'}
                        </button>
                      )}
                    </div>
                    {voucherError && <div className="text-danger small mt-1">{voucherError}</div>}
                    {appliedVoucher && <div className="text-success small mt-1">Đã áp dụng mã: <strong>{appliedVoucher.code}</strong></div>}
                  </div>
                  <hr />
                  {/* ================================== */}

                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Tạm tính</span>
                      <span>{formatPrice(subTotal)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Phí vận chuyển</span>
                      <span>{formatPrice(shippingFee)}</span>
                    </li>
                    
                    {/* Hiển thị dòng giảm giá nếu có */}
                    {appliedVoucher && (
                      <li className="list-group-item d-flex justify-content-between text-success">
                        <span>Giảm giá</span>
                        <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
                      </li>
                    )}

                    <li className="list-group-item d-flex justify-content-between fw-bold border-top pt-3">
                      <span>Tổng cộng</span>
                      <span className="text-danger fs-5">{formatPrice(finalTotal)}</span>
                    </li>
                  </ul>

                  <h6 className="mb-3">Phương thức thanh toán</h6>
                  <div className="mb-3">
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="radio" name="paymentMethod" 
                             id="paymentCOD" value="COD" 
                             checked={formData.paymentMethod === 'COD'} onChange={handleChange} />
                      <label className="form-check-label" htmlFor="paymentCOD">
                        <i className="fas fa-home me-2"></i>
                        Thanh toán khi nhận hàng (COD)
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input className="form-check-input" type="radio" name="paymentMethod" 
                             id="paymentMOMO" value="MOMO" 
                             checked={formData.paymentMethod === 'MOMO'} onChange={handleChange} />
                      <label className="form-check-label" htmlFor="paymentMOMO">
                        <i className="fab fa-app-store me-2"></i>
                        <span style={{ color: '#A4236B' }}>Ví MoMo</span>
                      </label>
                    </div>

                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="paymentMethod" 
                        id="paymentWALLET"
                        value="WALLET" 
                        onChange={handleChange} 
                        checked={formData.paymentMethod === 'WALLET'} 
                        disabled={walletBalance < finalTotal}
                      />
                      <label className="form-check-label" htmlFor="paymentWALLET">
                        <i className="fas fa-wallet me-2"></i>
                        Ví cá nhân
                        <span className="fw-bold text-success ms-2">{formatPrice(walletBalance)}</span>
                        {walletBalance < finalTotal && (
                          <span className="text-danger ms-2 small">(Không đủ số dư)</span>
                        )}
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success w-100 btn-lg" disabled={processing}>
                    <i className={`fas ${processing ? 'fa-spinner fa-spin' : 'fa-check-circle'} me-2`}></i>
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