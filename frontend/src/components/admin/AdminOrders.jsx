import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadOrders()
  }, [page])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAllOrders(page, 20)
      setOrders(response.content || [])
      setTotalPages(response.totalPages || 0)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    let confirmMessage = `Bạn có chắc muốn cập nhật trạng thái đơn hàng thành "${newStatus}"?`
    
    if (newStatus === 'CANCELLED') {
        confirmMessage = 'Bạn có chắc chắn muốn DUYỆT HỦY đơn hàng này không? \n(Tiền sẽ được hoàn về Ví khách hàng nếu đã thanh toán)'
    } else if (newStatus === 'CONFIRMED') {
        confirmMessage = 'Bạn có chắc chắn muốn TỪ CHỐI yêu cầu hủy và tiếp tục đơn hàng?'
    }

    if (window.confirm(confirmMessage)) {
      try {
        await adminService.updateOrderStatus(orderId, newStatus)
        await loadOrders()
        alert('Cập nhật trạng thái thành công!')
      } catch (error) {
        alert('Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message))
        console.error(error)
      }
    }
  }

  const getCancelReason = (note) => {
    if (!note) return null;
    const key = "[Lý do hủy]:";
    const index = note.indexOf(key);
    if (index !== -1) {
      return note.substring(index + key.length).trim();
    }
    return null; 
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
      'CANCELLED': 'danger',
      'CANCEL_REQUESTED': 'warning'
    }
    return badges[status] || 'secondary'
  }

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

  // --- MỚI: Hàm xử lý hiển thị Trạng thái thanh toán ---
  const getPaymentStatusBadge = (status) => {
    const badges = {
      'PENDING': 'warning',
      'SUCCESS': 'success',
      'FAILED': 'danger',
      'REFUNDED': 'primary' // Màu xanh dương cho hoàn tiền
    }
    return badges[status] || 'secondary'
  }

  const getPaymentStatusText = (status) => {
    const texts = {
      'PENDING': 'Chưa thanh toán',
      'SUCCESS': 'Đã thanh toán',
      'FAILED': 'Thanh toán lỗi',
      'REFUNDED': 'Đã hoàn tiền' // Text hiển thị
    }
    return texts[status] || status
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="fas fa-shopping-bag me-2"></i>
            Quản lý đơn hàng
          </h2>
          <Link to="/admin" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>Về Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th style={{ minWidth: '200px' }}>Trạng thái</th>
                    <th>Thanh toán</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const cancelReason = getCancelReason(order.notes);
                    return (
                      <tr key={order.id}>
                        <td><strong>{order.orderCode}</strong></td>
                        <td>
                          <div>
                            <div className="fw-bold">{order.customerName}</div>
                            <small className="text-muted">{order.customerPhone}</small>
                          </div>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <strong className="text-primary">{formatPrice(order.totalAmount)}</strong>
                        </td>
                        
                        <td>
                          <div className="d-flex flex-column align-items-start">
                            <span className={`badge bg-${getStatusBadge(order.orderStatus)} mb-1`}>
                              {getStatusText(order.orderStatus)}
                            </span>
                            
                            {order.orderStatus === 'CANCEL_REQUESTED' && cancelReason && (
                              <div className="mt-1 p-2 rounded border border-warning bg-warning bg-opacity-10 w-100">
                                <small className="text-warning-emphasis fw-bold d-block">
                                  <i className="fas fa-bullhorn me-1"></i>Lý do khách hủy:
                                </small>
                                <small className="text-muted fst-italic d-block text-wrap">
                                  "{cancelReason}"
                                </small>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* --- CẬP NHẬT CỘT THANH TOÁN --- */}
                        <td>
                          <span className={`badge bg-${getPaymentStatusBadge(order.paymentStatus)}`}>
                            {getPaymentStatusText(order.paymentStatus)}
                          </span>
                        </td>
                        
                        <td>
                          <div className="btn-group">
                            {order.orderStatus === 'CANCEL_REQUESTED' ? (
                              <>
                                <button
                                  className="btn btn-sm btn-success me-1"
                                  onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                  title="Đồng ý hủy đơn"
                                >
                                  <i className="fas fa-check me-1"></i>Duyệt
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                                  title="Từ chối hủy"
                                >
                                  <i className="fas fa-times me-1"></i>Từ chối
                                </button>
                              </>
                            ) : (
                              <>
                                {order.orderStatus === 'PENDING' && (
                                    <button className="btn btn-sm btn-success me-1" 
                                            onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} title="Xác nhận">
                                        <i className="fas fa-check"></i>
                                    </button>
                                )}
                                
                                {order.orderStatus === 'CONFIRMED' && (
                                    <button className="btn btn-sm btn-primary me-1" 
                                            onClick={() => handleUpdateStatus(order.id, 'PACKING')} title="Đóng gói">
                                        <i className="fas fa-box"></i>
                                    </button>
                                )}

                                {order.orderStatus === 'PACKING' && (
                                    <button className="btn btn-sm btn-info me-1" 
                                            onClick={() => handleUpdateStatus(order.id, 'SHIPPING')} title="Giao hàng">
                                        <i className="fas fa-truck"></i>
                                    </button>
                                )}

                                {order.orderStatus === 'SHIPPING' && (
                                    <button className="btn btn-sm btn-success me-1" 
                                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} title="Giao thành công">
                                        <i className="fas fa-check-circle"></i>
                                    </button>
                                )}

                                {(order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED') && (
                                    <button className="btn btn-sm btn-outline-danger" 
                                            onClick={() => handleUpdateStatus(order.id, 'CANCELLED')} title="Hủy đơn">
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 0}>Trước</button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(i)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages - 1}>Sau</button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminOrders