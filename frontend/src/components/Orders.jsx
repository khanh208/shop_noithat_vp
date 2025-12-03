import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import { orderService } from '../services/orderService'

const Orders = () => {
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
      const response = await orderService.getUserOrders(page, 10)
      setOrders(response.content || [])
      setTotalPages(response.totalPages || 0)
    } catch (error) {
      console.error('Error loading orders:', error)
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

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <h2 className="mb-4">
          <i className="fas fa-shopping-bag me-2"></i>
          Đơn hàng của tôi
        </h2>

        {orders.length === 0 ? (
          <div className="alert alert-info text-center">
            <i className="fas fa-shopping-bag fa-3x mb-3 text-muted"></i>
            <h4>Chưa có đơn hàng nào</h4>
            <p>Bạn chưa đặt đơn hàng nào</p>
            <Link to="/products" className="btn btn-primary">
              <i className="fas fa-shopping-bag me-2"></i>Mua sắm ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Ngày đặt</th>
                    <th>Số lượng sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
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
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td>{order.orderItems?.length || 0}</td>
                      <td>
                        <strong className="text-primary">
                          {formatPrice(order.totalAmount)}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/orders/${order.orderCode}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-eye me-1"></i>Chi tiết
                        </Link>
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

export default Orders




