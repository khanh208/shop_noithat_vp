import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navigation from './Navigation'
import { orderService } from '../services/orderService'

const OrderDetail = () => {
  const { orderCode } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrder()
  }, [orderCode])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrderByCode(orderCode)
      setOrder(data)
    } catch (err) {
      console.error('Error loading order:', err)
      setError('Không tìm thấy đơn hàng hoặc có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'PACKING': 'primary',
      'SHIPPING': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'danger'
    }
    return badges[status] || 'secondary'
  }

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'PACKING': 'Đang đóng gói',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'CANCELLED': 'Đã hủy'
    }
    return texts[status] || status
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-vh-100 bg-light">
        <Navigation />
        <div className="container my-5">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>{error}
          </div>
          <Link to="/orders" className="btn btn-primary">
            <i className="fas fa-arrow-left me-2"></i>Quay lại danh sách
          </Link>
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
            <i className="fas fa-file-invoice me-2"></i>
            Chi tiết đơn hàng #{order.orderCode}
          </h2>
          <Link to="/orders" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>Quay lại
          </Link>
        </div>

        <div className="row">
          {/* Thông tin chung */}
          <div className="col-md-8">
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Danh sách sản phẩm</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <strong>{item.productName}</strong>
                              {/* Có thể thêm ảnh sản phẩm nếu API trả về */}
                            </div>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatPrice(item.unitPrice)}</td>
                          <td className="text-end">{formatPrice(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end text-muted">Tạm tính:</td>
                        <td className="text-end">{formatPrice(order.subtotal)}</td>
                      </tr>
                      {order.discountAmount > 0 && (
                        <tr>
                          <td colSpan="3" className="text-end text-success">Giảm giá:</td>
                          <td className="text-end text-success">-{formatPrice(order.discountAmount)}</td>
                        </tr>
                      )}
                      {order.shippingFee > 0 && (
                        <tr>
                          <td colSpan="3" className="text-end text-muted">Phí vận chuyển:</td>
                          <td className="text-end">{formatPrice(order.shippingFee)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="3" className="text-end fw-bold fs-5">Tổng cộng:</td>
                        <td className="text-end fw-bold fs-5 text-primary">{formatPrice(order.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                  {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
        <div className="mt-3">
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              const reason = prompt("Nhập lý do hủy đơn hàng:")
              if (reason && reason.trim()) {
                orderService.requestCancel(order.id, reason) // Cần đảm bảo orderService có hàm này
                  .then(() => {
                    alert("Đã gửi yêu cầu hủy!")
                    loadOrder() // Reload lại đơn hàng
                  })
                  .catch(err => {
                    console.error(err)
                    alert("Lỗi gửi yêu cầu")
                  })
              }
            }}
          >
            Yêu cầu hủy đơn hàng
          </button>
        </div>
      )}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin người nhận & Trạng thái */}
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Thông tin đơn hàng</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="text-muted small">Trạng thái:</label>
                  <div>
                    <span className={`badge bg-${getStatusBadge(order.orderStatus)} fs-6`}>
                      {getStatusText(order.orderStatus)}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">Ngày đặt:</label>
                  <div className="fw-bold">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                <div className="mb-3">
                  <label className="text-muted small">Phương thức thanh toán:</label>
                  <div className="fw-bold">{order.paymentMethod}</div>
                  <div className={`small ${order.paymentStatus === 'SUCCESS' ? 'text-success' : 'text-warning'}`}>
                    {order.paymentStatus === 'SUCCESS' ? '(Đã thanh toán)' : '(Chưa thanh toán)'}
                  </div>
                </div>
                <hr />
                <h6 className="fw-bold">Địa chỉ nhận hàng</h6>
                <p className="mb-1"><strong>{order.customerName}</strong></p>
                <p className="mb-1">{order.customerPhone}</p>
                <p className="mb-1">{order.shippingAddress}</p>
                <p className="mb-0">
                  {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
                </p>
                
                {order.notes && (
                  <>
                    <hr />
                    <h6 className="fw-bold">Ghi chú</h6>
                    <p className="mb-0 text-muted fst-italic">{order.notes}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail