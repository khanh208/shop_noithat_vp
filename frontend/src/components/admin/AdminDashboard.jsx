import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'
import axios from 'axios'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [overview, setOverview] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [ordersByStatus, setOrdersByStatus] = useState({})
  const [revenueByCategory, setRevenueByCategory] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      // Load tất cả dữ liệu song song
      const [statsRes, overviewRes, productsRes, statusRes, categoryRes] = await Promise.all([
        axios.get('http://localhost:8082/api/admin/dashboard/stats', config),
        axios.get('http://localhost:8082/api/admin/analytics/overview', config),
        axios.get('http://localhost:8082/api/admin/analytics/top-selling-products?limit=5', config),
        axios.get('http://localhost:8082/api/admin/analytics/orders-by-status', config),
        axios.get('http://localhost:8082/api/admin/analytics/revenue-by-category', config)
      ])

      setStats(statsRes.data)
      setOverview(overviewRes.data)
      setTopProducts(productsRes.data)
      setOrdersByStatus(statusRes.data)
      setRevenueByCategory(categoryRes.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      alert('Lỗi khi tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  // --- HÀM XỬ LÝ EXPORT REPORT ---
  const handleExport = async (reportType) => {
    if (exporting) return;

    // Mặc định lấy dữ liệu 30 ngày gần nhất
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const confirmMessage = `Bạn có chắc muốn xuất báo cáo "${reportType === 'revenue' ? 'Doanh thu' : 'Sản phẩm'}" (Chỉ tính đơn giao thành công) trong 30 ngày gần nhất?`;
    if (!window.confirm(confirmMessage)) return;

    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      // Gọi API với responseType là blob để nhận file binary
      const response = await axios.get('http://localhost:8082/api/admin/analytics/export-report', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          reportType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        responseType: 'blob' 
      });

      // Tạo URL download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `BaoCao_${reportType === 'revenue' ? 'DoanhThu' : 'SanPham'}_${dateStr}.xlsx`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Lỗi xuất báo cáo:', error);
      alert('Xuất báo cáo thất bại. Vui lòng thử lại.');
    } finally {
      setExporting(false);
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="fas fa-tachometer-alt me-2"></i>
            Dashboard Quản Trị
          </h2>
          <div>
            <Link to="/admin/categories" className="btn btn-info me-2 text-white">
              <i className="fas fa-tags me-2"></i>Quản lý danh mục
            </Link>
            
            <Link to="/admin/products" className="btn btn-primary me-2">
              <i className="fas fa-box me-2"></i>Quản lý sản phẩm
            </Link>
            <Link to="/admin/orders" className="btn btn-success">
              <i className="fas fa-shopping-bag me-2"></i>Quản lý đơn hàng
            </Link>
          </div>
        </div>

        {/* Tổng quan - Row 1 */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-primary shadow-sm">
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
            <div className="card border-success shadow-sm">
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
            <div className="card border-warning shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Đơn chờ xử lý</h6>
                    <h4 className="mb-0 text-warning">{stats?.pendingOrders || 0}</h4>
                    <small className="text-muted">
                      <i className="fas fa-clock"></i> Cần xử lý
                    </small>
                  </div>
                  <i className="fas fa-hourglass-half fa-3x text-warning opacity-25"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-info shadow-sm">
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
            <div className="card border-secondary shadow-sm">
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
            <div className="card border-danger shadow-sm">
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

        {/* Thống kê chi tiết */}
        <div className="row">
          {/* Top sản phẩm bán chạy */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-fire me-2"></i>
                  Top 5 Sản Phẩm Bán Chạy (Đã giao)
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-end">Đã bán</th>
                        <th className="text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={product.productId}>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Đơn hàng theo trạng thái */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-chart-pie me-2"></i>
                  Đơn Hàng Theo Trạng Thái
                </h5>
              </div>
              <div className="card-body">
                {Object.entries(ordersByStatus).map(([status, count]) => (
                  <div key={status} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>
                        <span className={`badge bg-${getStatusBadge(status)} me-2`}>
                          {getStatusText(status)}
                        </span>
                      </span>
                      <strong>{count} đơn</strong>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className={`progress-bar bg-${getStatusBadge(status)}`}
                        style={{ 
                          width: `${(count / (overview?.totalOrders || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Doanh thu theo danh mục */}
          <div className="col-md-12 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="fas fa-tags me-2"></i>
                  Doanh Thu Theo Danh Mục (Đã giao)
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Danh mục</th>
                        <th className="text-end">Sản phẩm đã bán</th>
                        <th className="text-end">Doanh thu</th>
                        <th className="text-end">% Tổng doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueByCategory.map((category) => {
                        const percentage = ((category.revenue / (overview?.totalRevenue || 1)) * 100).toFixed(1)
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
                            <td className="text-end">
                              <div className="d-flex align-items-center justify-content-end">
                                <div className="progress me-2" style={{ width: '100px', height: '20px' }}>
                                  <div 
                                    className="progress-bar bg-info"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span>{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
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
                  <div className="col-md-3 mb-3">
                    <Link to="/admin/analytics/low-stock" className="btn btn-outline-danger w-100">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Sản phẩm sắp hết
                    </Link>
                  </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard