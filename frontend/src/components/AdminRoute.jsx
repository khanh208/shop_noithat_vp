import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'SALES' && user?.role !== 'WAREHOUSE' && user?.role !== 'MARKETING') {
    return (
      <div className="min-vh-100 bg-light d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h2 className="text-danger">
            <i className="fas fa-ban me-2"></i>
            Không có quyền truy cập
          </h2>
          <p className="text-muted">Bạn không có quyền truy cập trang quản trị</p>
          <a href="/home" className="btn btn-primary">Về trang chủ</a>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute



