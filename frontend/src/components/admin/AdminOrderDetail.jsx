import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navigation from '../Navigation'
import { orderService } from '../../services/orderService'
import { adminService } from '../../services/adminService'

const AdminOrderDetail = () => {
  const { orderCode } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [orderCode])

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrderByCode(orderCode)
      setOrder(data)
    } catch (error) {
      alert("Không tìm thấy đơn hàng")
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    let confirmMsg = `Xác nhận chuyển trạng thái sang: ${newStatus}?`
    if (newStatus === 'CANCELLED') confirmMsg = 'Bạn có chắc muốn hủy đơn hàng này? Tiền sẽ được hoàn (nếu có).'
    
    if(window.confirm(confirmMsg)) {
        try {
            await adminService.updateOrderStatus(order.id, newStatus)
            loadOrder()
            alert('Cập nhật trạng thái thành công!')
        } catch(e) {
            alert('Lỗi cập nhật trạng thái: ' + (e.response?.data?.message || e.message))
        }
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  // === CÁC HÀM HELPER CHUYỂN ĐỔI TIẾNG VIỆT & MÀU SẮC ===
  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'PACKING': 'Đang đóng gói',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Giao thành công',
      'CANCELLED': 'Đã hủy',
      'CANCEL_REQUESTED': 'Yêu cầu hủy'
    }
    return texts[status] || status
  }

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'PACKING': 'primary',
      'SHIPPING': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger',
      'CANCEL_REQUESTED': 'danger' // Màu đỏ để chú ý
    }
    return badges[status] || 'secondary'
  }

  const getPaymentStatusText = (status) => {
    const texts = {
      'PENDING': 'Chưa thanh toán',
      'SUCCESS': 'Đã thanh toán',
      'FAILED': 'Thanh toán thất bại',
      'REFUNDED': 'Đã hoàn tiền'
    }
    return texts[status] || status
  }

  const getPaymentStatusBadge = (status) => {
    const badges = {
      'PENDING': 'warning',
      'SUCCESS': 'success',
      'FAILED': 'danger',
      'REFUNDED': 'primary'
    }
    return badges[status] || 'secondary'
  }

  const getPaymentMethodText = (method) => {
    const texts = {
      'COD': 'Thanh toán khi nhận hàng (COD)',
      'MOMO': 'Ví MoMo',
      'WALLET': 'Ví cá nhân',
      'BANK_TRANSFER': 'Chuyển khoản ngân hàng'
    }
    return texts[method] || method
  }
  // ========================================================

  if (loading) return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="text-center mt-5"><div className="spinner-border"></div></div>
    </div>
  )

  if (!order) return null

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h3><i className="fas fa-clipboard-list me-2"></i>Chi tiết đơn hàng: {order.orderCode}</h3>
            <Link to="/admin/orders" className="btn btn-secondary">
              <i className="fas fa-arrow-left me-2"></i>Quay lại danh sách
            </Link>
        </div>

        <div className="row">
            {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
            <div className="col-md-5">
                <div className="card border-primary mb-4 shadow-sm">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0"><i className="fas fa-shipping-fast me-2"></i>Thông tin Giao Hàng</h5>
                    </div>
                    <div className="card-body">
                        <table className="table table-borderless">
                            <tbody>
                                <tr>
                                    <th style={{width: '35%'}}>Người nhận:</th>
                                    <td className="fs-5 fw-bold">{order.customerName}</td>
                                </tr>
                                <tr>
                                    <th>Điện thoại:</th>
                                    <td className="fs-5">
                                        <a href={`tel:${order.customerPhone}`} className="text-decoration-none fw-bold text-danger">
                                            <i className="fas fa-phone-alt me-2"></i>{order.customerPhone}
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Địa chỉ:</th>
                                    <td>
                                        <div className="fw-bold">{order.shippingAddress}</div>
                                        <div className="text-muted small">
                                            {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Ghi chú:</th>
                                    <td>
                                      {order.notes ? (
                                        <div className="alert alert-warning p-2 mb-0 fst-italic">
                                          {order.notes}
                                        </div>
                                      ) : <span className="text-muted">Không có</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card mb-4 shadow-sm">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0"><i className="fas fa-cog me-2"></i>Xử lý trạng thái</h5>
                    </div>
                    <div className="card-body">
                        {/* === PHẦN SỬA LẠI TIẾNG VIỆT & BADGE === */}
                        <div className="mb-3">
                          <strong>Trạng thái: </strong>
                          <span className={`badge bg-${getStatusBadge(order.orderStatus)} ms-2 fs-6`}>
                            {getStatusText(order.orderStatus)}
                          </span>
                        </div>
                        <div className="mb-3">
                          <strong>Thanh toán: </strong>
                          <span className={`badge bg-${getPaymentStatusBadge(order.paymentStatus)} ms-2 fs-6`}>
                            {getPaymentStatusText(order.paymentStatus)}
                          </span>
                          <div className="small text-muted mt-2">
                            <i className="fas fa-credit-card me-1"></i>
                            Phương thức: <strong>{getPaymentMethodText(order.paymentMethod)}</strong>
                          </div>
                        </div>
                        {/* ========================================= */}
                        <hr/>
                        <div className="d-grid gap-2">
                            {order.orderStatus === 'PENDING' && (
                                <button className="btn btn-success" onClick={() => handleStatusChange('CONFIRMED')}>
                                    <i className="fas fa-check me-2"></i>Xác nhận đơn hàng
                                </button>
                            )}
                            {order.orderStatus === 'CONFIRMED' && (
                                <button className="btn btn-primary" onClick={() => handleStatusChange('PACKING')}>
                                    <i className="fas fa-box me-2"></i>Đóng gói xong
                                </button>
                            )}
                            {order.orderStatus === 'PACKING' && (
                                <button className="btn btn-warning text-dark" onClick={() => handleStatusChange('SHIPPING')}>
                                    <i className="fas fa-truck me-2"></i>Bắt đầu giao hàng
                                </button>
                            )}
                            {order.orderStatus === 'SHIPPING' && (
                                <button className="btn btn-success" onClick={() => handleStatusChange('DELIVERED')}>
                                    <i className="fas fa-check-circle me-2"></i>Xác nhận đã giao
                                </button>
                            )}
                            {['PENDING', 'CONFIRMED', 'PACKING'].includes(order.orderStatus) && (
                                <button className="btn btn-outline-danger mt-2" onClick={() => handleStatusChange('CANCELLED')}>
                                    <i className="fas fa-times me-2"></i>Hủy đơn hàng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
            <div className="col-md-7">
                <div className="card shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Chi tiết sản phẩm</h5>
                        <span className="badge bg-secondary">{order.orderItems.length} sản phẩm</span>
                    </div>
                    <div className="card-body p-0">
                        <table className="table table-striped table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th className="text-center">SL</th>
                                    <th className="text-end">Đơn giá</th>
                                    <th className="text-end">Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="fw-bold">{item.productName}</div>
                                        </td>
                                        <td className="text-center fw-bold fs-5">{item.quantity}</td>
                                        <td className="text-end text-muted">{formatPrice(item.unitPrice)}</td>
                                        <td className="text-end fw-bold">{formatPrice(item.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-group-divider">
                                <tr>
                                    <td colSpan="3" className="text-end">Tạm tính:</td>
                                    <td className="text-end">{formatPrice(order.subtotal)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" className="text-end">Phí ship:</td>
                                    <td className="text-end">{formatPrice(order.shippingFee)}</td>
                                </tr>
                                {order.discountAmount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-end text-success">Giảm giá:</td>
                                        <td className="text-end text-success">-{formatPrice(order.discountAmount)}</td>
                                    </tr>
                                )}
                                <tr className="table-active">
                                    <td colSpan="3" className="text-end fw-bold fs-5 align-middle">TỔNG THU:</td>
                                    <td className="text-end">
                                        {order.paymentStatus === 'SUCCESS' ? (
                                            <div className="fw-bold fs-4 text-success">
                                                0 ₫ <span className="fs-6 fw-normal">(Đã thanh toán)</span>
                                            </div>
                                        ) : (
                                            <div className="fw-bold fs-4 text-danger">
                                                {order.paymentMethod === 'COD' 
                                                    ? formatPrice(order.totalAmount) 
                                                    : '0 ₫'
                                                }
                                                <div className="small text-muted fs-6 fw-normal">
                                                    {order.paymentMethod === 'COD' 
                                                        ? '(Cần thu hộ COD)' 
                                                        : '(Chờ thanh toán Online)'}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail