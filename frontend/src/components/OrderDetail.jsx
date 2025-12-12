import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navigation from './Navigation'
import { orderService } from '../services/orderService'
import { reviewService } from '../services/reviewService'

const OrderDetail = () => {
  const { orderCode } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewItem, setReviewItem] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderCode])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrderByCode(orderCode)
      setOrder(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Mở modal đánh giá
  const handleOpenReview = (item) => {
    setReviewItem(item)
    setRating(5)
    setComment('')
    setShowReviewModal(true)
  }

  // Gửi đánh giá
  const handleSubmitReview = async () => {
    if (!reviewItem) return

    setSubmittingReview(true)
    try {
      // Backend: createReview(Long userId, ReviewRequest request)
      // ReviewRequest: productId, orderId, rating, comment
      
      // Lấy productId từ orderItem (Lưu ý: API Order trả về structure nào)
      const productId = reviewItem.product?.id || reviewItem.productId 
      
      if (!productId) {
        alert("Lỗi: Không tìm thấy ID sản phẩm")
        return
      }

      await reviewService.createReview({
        productId: productId,
        orderId: order.id,
        rating: rating,
        comment: comment
      })

      alert('Cảm ơn bạn đã đánh giá sản phẩm!')
      setShowReviewModal(false)
      // Optional: Load lại order để disable nút đánh giá nếu muốn (cần BE hỗ trợ check)
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá')
    } finally {
      setSubmittingReview(false)
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

  if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>
  if (!order) return <div className="text-center mt-5">Không tìm thấy đơn hàng</div>

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Chi tiết đơn hàng #{order.orderCode}</h3>
          <Link to="/orders" className="btn btn-secondary">Quay lại</Link>
        </div>

        <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
                <div className="row">
                    <div className="col-md-6">
                        <strong>Trạng thái: </strong> 
                        <span className="badge bg-info">{order.orderStatus}</span>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <small className="text-muted">Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</small>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th className="text-center">Số lượng</th>
                                <th className="text-end">Thành tiền</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="fw-bold">{item.productName}</div>
                                    </td>
                                    <td>{formatPrice(item.unitPrice)}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-end">{formatPrice(item.totalPrice)}</td>
                                    <td>
                                        {/* Chỉ hiện nút đánh giá khi đã giao hàng thành công */}
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
                    </table>
                </div>
            </div>
        </div>

        {/* MODAL ĐÁNH GIÁ (Thủ công, không dùng Bootstrap JS để tránh lỗi conflict) */}
        {showReviewModal && (
            <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Đánh giá sản phẩm</h5>
                            <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p className="fw-bold text-primary mb-3">{reviewItem?.productName}</p>
                            
                            <div className="mb-3 text-center">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <i 
                                        key={star}
                                        className={`fas fa-star fa-2x ${star <= rating ? 'text-warning' : 'text-muted'}`}
                                        style={{cursor: 'pointer', margin: '0 5px'}}
                                        onClick={() => setRating(star)}
                                    ></i>
                                ))}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Nhận xét của bạn</label>
                                <textarea 
                                    className="form-control" 
                                    rows="4" 
                                    placeholder="Sản phẩm dùng tốt không? Chất lượng thế nào?"
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
                                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}

export default OrderDetail