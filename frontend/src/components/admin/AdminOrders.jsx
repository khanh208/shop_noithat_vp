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
    if (window.confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng thành "${newStatus}"?`)) {
      try {
        await adminService.updateOrderStatus(orderId, newStatus)
        await loadOrders()
        alert('Cập nhật trạng thái thành công!')
      } catch (error) {
        alert('Lỗi khi cập nhật trạng thái')
        console.error(error)
      }
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
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Số lượng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thanh toán</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.orderCode}</strong>
                      </td>
                      <td>
                        <div>
                          <div>{order.customerName}</div>
                          <small className="text-muted">{order.customerPhone}</small>
                        </div>
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td>{order.orderItems?.length || 0}</td>
                      <td>
                        <strong className="text-primary">
                          {formatPrice(order.totalAmount)}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${order.paymentStatus === 'PAID' ? 'success' : 'warning'}`}>
                          {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          {order.orderStatus === 'PENDING' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                              title="Xác nhận đơn hàng"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          {order.orderStatus === 'CONFIRMED' && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleUpdateStatus(order.id, 'PACKING')}
                              title="Đóng gói"
                            >
                              <i className="fas fa-box"></i>
                            </button>
                          )}
                          {order.orderStatus === 'PACKING' && (
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                              title="Giao hàng"
                            >
                              <i className="fas fa-truck"></i>
                            </button>
                          )}
                          {order.orderStatus === 'SHIPPING' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                              title="Hoàn thành"
                            >
                              <i className="fas fa-check-circle"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 0}>
                      Trước
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(i)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages - 1}>
                      Sau
                    </button>
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



