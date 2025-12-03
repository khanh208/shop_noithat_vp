import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../Navigation'
import { adminService } from '../../services/adminService'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await adminService.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
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
            <Link to="/admin/products" className="btn btn-primary me-2">
              <i className="fas fa-box me-2"></i>Quản lý sản phẩm
            </Link>
            <Link to="/admin/orders" className="btn btn-success">
              <i className="fas fa-shopping-bag me-2"></i>Quản lý đơn hàng
            </Link>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card border-primary">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Tổng sản phẩm</h6>
                    <h3 className="mb-0 text-primary">{stats?.totalProducts || 0}</h3>
                  </div>
                  <i className="fas fa-box fa-2x text-primary"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-success">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Tổng đơn hàng</h6>
                    <h3 className="mb-0 text-success">{stats?.totalOrders || 0}</h3>
                  </div>
                  <i className="fas fa-shopping-bag fa-2x text-success"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-warning">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Đơn chờ xử lý</h6>
                    <h3 className="mb-0 text-warning">{stats?.pendingOrders || 0}</h3>
                  </div>
                  <i className="fas fa-clock fa-2x text-warning"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-info">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Tổng doanh thu</h6>
                    <h5 className="mb-0 text-info">{formatPrice(stats?.totalRevenue || 0)}</h5>
                  </div>
                  <i className="fas fa-dollar-sign fa-2x text-info"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  Thống kê nhanh
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Quản lý sản phẩm</h6>
                    <p className="text-muted">Xem và quản lý tất cả sản phẩm trong hệ thống</p>
                    <Link to="/admin/products" className="btn btn-outline-primary">
                      <i className="fas fa-arrow-right me-2"></i>Đi đến
                    </Link>
                  </div>
                  <div className="col-md-6">
                    <h6>Quản lý đơn hàng</h6>
                    <p className="text-muted">Xem và xử lý các đơn hàng</p>
                    <Link to="/admin/orders" className="btn btn-outline-success">
                      <i className="fas fa-arrow-right me-2"></i>Đi đến
                    </Link>
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



