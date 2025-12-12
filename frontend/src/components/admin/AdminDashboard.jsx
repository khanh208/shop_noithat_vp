import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminDashboard = () => {
  // State dữ liệu
  const [stats, setStats] = useState(null)
  const [overview, setOverview] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [ordersByStatus, setOrdersByStatus] = useState({})
  const [revenueByCategory, setRevenueByCategory] = useState([])
  
  // State giao diện
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // State bộ lọc thời gian (Mặc định 30 ngày gần nhất)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async (useFilter = false) => {
    setLoading(true)
    try {
      // Chuyển đổi string date sang Object Date để gửi API
      const start = useFilter ? new Date(dateRange.startDate) : undefined
      const end = useFilter ? new Date(dateRange.endDate) : undefined
      
      // Nếu lọc theo ngày, set giờ cuối ngày cho endDate để lấy trọn vẹn dữ liệu ngày đó
      if (end) end.setHours(23, 59, 59, 999)

      // Gọi API song song
      const [statsRes, overviewRes, productsRes, statusRes, categoryRes] = await Promise.all([
        adminService.getDashboardStats(),     // Card thống kê chung (số lượng user, sp...)
        adminService.getDashboardOverview(),  // Overview doanh thu tổng
        adminService.getTopSellingProducts(5, start, end), // Top sản phẩm (CÓ LỌC NGÀY)
        adminService.getOrdersByStatus(),     // Trạng thái đơn (Hiện tại)
        adminService.getRevenueByCategory(start, end)      // Danh mục (CÓ LỌC NGÀY)
      ])

      setStats(statsRes)
      setOverview(overviewRes)
      setTopProducts(productsRes)
      setOrdersByStatus(statusRes)
      setRevenueByCategory(categoryRes)

    } catch (error) {
      console.error('Error loading dashboard:', error)
      alert('Lỗi tải dữ liệu dashboard. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Xử lý sự kiện nút "Lọc"
  const handleFilter = () => {
    loadDashboardData(true)
  }

  // Xử lý thay đổi input ngày
  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    })
  }

  // Xử lý Export Excel
  const handleExport = async (type) => {
    if (exporting) return
    
    const confirmMsg = `Bạn muốn xuất báo cáo "${type === 'revenue' ? 'Doanh thu' : 'Sản phẩm'}" từ ${dateRange.startDate} đến ${dateRange.endDate}?`;
    if (!window.confirm(confirmMsg)) return

    setExporting(true)
    try {
      const start = new Date(dateRange.startDate)
      const end = new Date(dateRange.endDate)
      end.setHours(23, 59, 59, 999)

      const blob = await adminService.exportReport(type, start, end)
      
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `BaoCao_${type}_${dateStr}.xlsx`)
      document.body.appendChild(link)
      link.click()
      
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error);
      alert('Xuất báo cáo thất bại!')
    } finally {
      setExporting(false)
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
        {/* Header & Bộ lọc */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <h2 className="mb-3 mb-md-0">
            <i className="fas fa-tachometer-alt me-2"></i>
            Dashboard Quản Trị
          </h2>
          
          <div className="d-flex gap-2 bg-white p-2 rounded shadow-sm align-items-center">
            <div className="input-group">
                <span className="input-group-text bg-light">Từ</span>
                <input 
                  type="date" 
                  name="startDate"
                  className="form-control"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
            </div>
            <div className="input-group">
                <span className="input-group-text bg-light">Đến</span>
                <input 
                  type="date" 
                  name="endDate"
                  className="form-control"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
            </div>
            <button className="btn btn-primary px-4" onClick={handleFilter}>
              <i className="fas fa-filter me-2"></i>Lọc
            </button>
          </div>
        </div>

        {/* Tổng quan - Row 1 */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-primary shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Tổng doanh thu (Thực tế)</h6>
                    <h4 className="mb-0 text-primary">{formatPrice(overview?.totalRevenue || 0)}</h4>
                    <small className="text-success">
                      <i className="fas fa-arrow-up"></i> Tháng này: {formatPrice(overview?.monthlyRevenue || 0)}
                    </small>
                  </div>
                  <i className="fas fa-dollar-sign fa-3x text-primary opacity-25"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-success shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Tổng đơn hàng</h6>
                    <h4 className="mb-0 text-success">{overview?.totalOrders || 0}</h4>
                    <small className="text-success">
                      <i className="fas fa-arrow-up"></i> Tháng này: {overview?.monthlyOrders || 0}
                    </small>
                  </div>
                  <i className="fas fa-shopping-bag fa-3x text-success opacity-25"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-warning shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Đơn chờ xử lý</h6>
                    <h4 className="mb-0 text-warning">{stats?.pendingOrders || 0}</h4>
                    <small className="text-muted">
                      <i className="fas fa-clock"></i> Cần xử lý ngay
                    </small>
                  </div>
                  <i className="fas fa-hourglass-half fa-3x text-warning opacity-25"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-info shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Tổng khách hàng</h6>
                    <h4 className="mb-0 text-info">{overview?.totalCustomers || 0}</h4>
                    <small className="text-success">
                      <i className="fas fa-user-plus"></i> Mới: {overview?.newCustomers || 0}
                    </small>
                  </div>
                  <i className="fas fa-users fa-3x text-info opacity-25"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng quan - Row 2 */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-secondary shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Tổng sản phẩm</h6>
                    <h4 className="mb-0 text-secondary">{overview?.totalProducts || 0}</h4>
                    <small className="text-muted">
                      <i className="fas fa-box"></i> Đang bán
                    </small>
                  </div>
                  <i className="fas fa-box-open fa-3x text-secondary opacity-25"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-danger shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Sắp hết hàng</h6>
                    <h4 className="mb-0 text-danger">{overview?.lowStockProducts || 0}</h4>
                    <small className="text-danger">
                      <i className="fas fa-exclamation-triangle"></i> Cần nhập
                    </small>
                  </div>
                  <i className="fas fa-warehouse fa-3x text-danger opacity-25"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê chi tiết (Có áp dụng bộ lọc) */}
        <div className="row">
          {/* Top sản phẩm bán chạy */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-fire me-2"></i>
                  Top 5 Sản Phẩm Bán Chạy (Đã giao)
                </h5>
                <small className="badge bg-light text-primary">Theo bộ lọc</small>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-end">Đã bán</th>
                        <th className="text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length > 0 ? topProducts.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="badge bg-secondary me-2">{index + 1}</span>
                              <div>
                                <strong>{product.productName}</strong>
                                <br />
                                <small className="text-muted">{formatPrice(product.price)}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <span className="badge bg-info">{product.quantitySold}</span>
                          </td>
                          <td className="text-end">
                            <strong className="text-success">{formatPrice(product.revenue)}</strong>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                            <td colSpan="3" className="text-center py-4 text-muted">
                                Không có dữ liệu trong khoảng thời gian này
                            </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Doanh thu theo danh mục */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-tags me-2"></i>
                  Doanh Thu Theo Danh Mục (Đã giao)
                </h5>
                <small className="badge bg-light text-info">Theo bộ lọc</small>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Danh mục</th>
                        <th className="text-end">SL Bán</th>
                        <th className="text-end">Doanh thu</th>
                        <th className="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByCategory.length > 0 ? revenueByCategory.map((category) => {
                        const percentage = overview?.totalRevenue > 0 
                            ? ((category.revenue / overview.totalRevenue) * 100).toFixed(1) 
                            : 0;
                        return (
                          <tr key={category.categoryId}>
                            <td>
                              <strong>{category.categoryName}</strong>
                            </td>
                            <td className="text-end">
                              <span className="badge bg-secondary">{category.productsSold}</span>
                            </td>
                            <td className="text-end">
                              <strong className="text-success">{formatPrice(category.revenue)}</strong>
                            </td>
                            <td className="text-end" style={{width: "20%"}}>
                              <div className="d-flex align-items-center justify-content-end">
                                <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                  <div 
                                    className="progress-bar bg-info"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="small">{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      }) : (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-muted">
                                Không có dữ liệu doanh thu
                            </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Đơn hàng theo trạng thái (Luôn hiển thị realtime) */}
        <div className="row mb-4">
            <div className="col-12">
                <div className="card shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0"><i className="fas fa-chart-pie me-2"></i>Đơn Hàng Theo Trạng Thái (Hiện tại)</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {Object.entries(ordersByStatus).map(([status, count]) => (
                            <div key={status} className="col-md-2 col-6 mb-3 text-center">
                                <div className="p-3 border rounded bg-light h-100">
                                    <h3 className="mb-1">{count}</h3>
                                    <span className={`badge bg-${getStatusBadge(status)}`}>
                                        {getStatusText(status)}
                                    </span>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Quick Actions & Export */}
        <div className="row">
          <div className="col-md-12">
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="fas fa-bolt me-2"></i>
                  Thao Tác Nhanh
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <Link to="/admin/products/new" className="btn btn-outline-primary w-100">
                      <i className="fas fa-plus-circle me-2"></i>
                      Thêm sản phẩm mới
                    </Link>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <Link to="/admin/categories/new" className="btn btn-outline-info w-100">
                      <i className="fas fa-folder-plus me-2"></i>
                      Thêm danh mục mới
                    </Link>
                  </div>

                  <div className="col-md-3 mb-3">
                    <Link to="/admin/orders?status=PENDING" className="btn btn-outline-warning w-100">
                      <i className="fas fa-clock me-2"></i>
                      Xem đơn chờ xử lý
                    </Link>
                  </div>
                  
                  {/* --- NÚT EXPORT --- */}
                  <div className="col-md-3 mb-3">
                    <div className="btn-group w-100">
                      <button 
                        className="btn btn-outline-success dropdown-toggle" 
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        disabled={exporting}
                      >
                        {exporting ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Đang xuất...</>
                        ) : (
                          <><i className="fas fa-file-excel me-2"></i>Xuất báo cáo</>
                        )}
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button className="dropdown-item" onClick={() => handleExport('revenue')}>
                            <i className="fas fa-money-bill me-2 text-success"></i>Báo cáo Doanh thu
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => handleExport('products')}>
                            <i className="fas fa-box me-2 text-primary"></i>Báo cáo Sản phẩm
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                </div>
                <div className="col-md-3 mb-3">
                <Link to="/admin/banners" className="btn btn-outline-purple w-100" style={{borderColor: '#6f42c1', color: '#6f42c1'}}>
                  <i className="fas fa-images me-2"></i>
                  Quản lý Banner
                </Link>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard