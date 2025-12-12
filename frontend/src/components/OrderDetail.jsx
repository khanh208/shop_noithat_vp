import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navigation from './Navigation'
import { orderService } from '../services/orderService'
import { reviewService } from '../services/reviewService'

const OrderDetail = () => {
  const { orderCode } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // --- STATE CHO MODAL ĐÁNH GIÁ ---
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null) // Sản phẩm đang được đánh giá
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderCode])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await orderService.getOrderByCode(orderCode)
      setOrder(data)
    } catch (err) {
      console.error('Error loading order:', err)
      setError('Không tìm thấy đơn hàng hoặc có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  // --- XỬ LÝ HỦY ĐƠN HÀNG ---
  const handleRequestCancel = async () => {
    const reason = prompt("Nhập lý do hủy đơn hàng:")
    if (reason && reason.trim()) {
      try {
        await orderService.requestCancel(order.id, reason)
        alert("Đã gửi yêu cầu hủy thành công!")
        loadOrder() // Tải lại dữ liệu để cập nhật trạng thái
      } catch (err) {
        console.error(err)
        alert(err.response?.data?.message || "Lỗi khi gửi yêu cầu hủy")
      }
    }
  }

  // --- XỬ LÝ ĐÁNH GIÁ ---
  const handleOpenReview = (item) => {
    setSelectedItem(item)
    setRating(5)
    setComment('')
    setShowReviewModal(true)
  }

  const handleSubmitReview = async () => {
    // Lấy ID sản phẩm an toàn (tùy thuộc vào cấu trúc trả về của API order)
    const productId = selectedItem?.product?.id || selectedItem?.productId
    
    if (!productId) {
      alert('Không xác định được sản phẩm để đánh giá')
      return
    }

    setSubmittingReview(true)
    try {
      await reviewService.createReview({
        productId: productId,
        orderId: order.id,
        rating: rating,
        comment: comment
      })

      alert('Đánh giá thành công!')
      setShowReviewModal(false)
      // Có thể load lại order nếu backend có cập nhật trạng thái "đã đánh giá" cho item
      // await loadOrder() 
    } catch (err) {
      console.error('Lỗi gửi đánh giá', err)
      alert(err.response?.data?.message || 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // --- HELPERS ---
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
      'CANCELLED': 'danger',
      'CANCEL_REQUESTED': 'secondary'
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
      'CANCELLED': 'Đã hủy',
      'CANCEL_REQUESTED': 'Đang yêu cầu hủy'
    }
    return texts[status] || status
  }

  // --- RENDER ---
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
        {/* Header */}
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
          {/* Cột Trái: Danh sách sản phẩm */}
          <div className="col-md-8">
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Danh sách sản phẩm</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền</th>
                        <th className="text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex flex-column">
                              <span className="fw-bold">{item.productName}</span>
                            </div>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatPrice(item.unitPrice)}</td>
                          <td className="text-end">{formatPrice(item.totalPrice)}</td>
                          <td className="text-center">
                            {/* Chỉ hiện nút Đánh giá khi đã Giao hàng */}
                            {order.orderStatus === 'DELIVERED' && (
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleOpenReview(item)}
                              >
                                <i className="fas fa-star me-1"></i>Đánh giá
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end text-muted">Tạm tính:</td>
                        <td className="text-end" colSpan="2">{formatPrice(order.subtotal)}</td>
                      </tr>
                      {order.discountAmount > 0 && (
                        <tr>
                          <td colSpan="3" className="text-end text-success">Giảm giá:</td>
                          <td className="text-end text-success" colSpan="2">-{formatPrice(order.discountAmount)}</td>
                        </tr>
                      )}
                      {order.shippingFee > 0 && (
                        <tr>
                          <td colSpan="3" className="text-end text-muted">Phí vận chuyển:</td>
                          <td className="text-end" colSpan="2">{formatPrice(order.shippingFee)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="3" className="text-end fw-bold fs-5">Tổng cộng:</td>
                        <td className="text-end fw-bold fs-5 text-primary" colSpan="2">{formatPrice(order.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Nút Hủy đơn hàng */}
                  {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
                    <div className="mt-3 text-end">
                      <button
                        className="btn btn-outline-danger"
                        onClick={handleRequestCancel}
                      >
                        <i className="fas fa-times me-2"></i>Yêu cầu hủy đơn hàng
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cột Phải: Thông tin đơn hàng */}
          <div className="col-md-4">
            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Thông tin đơn hàng</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="text-muted small d-block">Trạng thái:</label>
                  <span className={`badge bg-${getStatusBadge(order.orderStatus)} fs-6`}>
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Ngày đặt:</label>
                  <span className="fw-bold">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="mb-3">
                  <label className="text-muted small d-block">Thanh toán:</label>
                  <div className="fw-bold">{order.paymentMethod}</div>
                  <div className="small">
                    {order.paymentStatus === 'SUCCESS' && <span className="text-success">(Đã thanh toán)</span>}
                    {order.paymentStatus === 'PENDING' && <span className="text-warning">(Chưa thanh toán)</span>}
                    {order.paymentStatus === 'FAILED' && <span className="text-danger">(Thanh toán thất bại)</span>}
                    {order.paymentStatus === 'REFUNDED' && <span className="text-primary fw-bold">(Đã hoàn tiền)</span>}
                  </div>
                </div>
                
                <hr />
                
                <h6 className="fw-bold">Địa chỉ nhận hàng</h6>
                <p className="mb-1 text-primary fw-bold">{order.customerName}</p>
                <p className="mb-1"><i className="fas fa-phone me-2 text-muted"></i>{order.customerPhone}</p>
                <p className="mb-1"><i className="fas fa-map-marker-alt me-2 text-muted"></i>{order.shippingAddress}</p>
                <p className="mb-0 ms-4 text-muted small">
                  {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
                </p>
                
                {order.notes && (
                  <>
                    <hr />
                    <h6 className="fw-bold">Ghi chú</h6>
                    <div className="alert alert-light border fst-italic mb-0 small">
                      {order.notes}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ĐÁNH GIÁ */}
      {showReviewModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Đánh giá sản phẩm</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Sản phẩm: <strong>{selectedItem?.productName || selectedItem?.product?.name}</strong></p>

                <div className="mb-3 text-center fs-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <i
                      key={star}
                      className={`fas fa-star ${star <= rating ? 'text-warning' : 'text-muted'}`}
                      onClick={() => setRating(star)}
                      style={{ cursor: 'pointer', margin: '0 5px' }}
                    ></i>
                  ))}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Nhận xét của bạn</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Chất lượng sản phẩm thế nào? Bạn có hài lòng không?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Hủy</button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi đánh giá'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail