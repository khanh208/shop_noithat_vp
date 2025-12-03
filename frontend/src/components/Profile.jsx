import React from 'react'
import Navigation from './Navigation'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user } = useAuth()

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      
      <div className="container my-4">
        <h2 className="mb-4">
          <i className="fas fa-user-circle me-2"></i>
          Thông tin tài khoản
        </h2>

        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Thông tin cá nhân</h5>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Tên đăng nhập:</label>
                  <p className="form-control-plaintext">{user?.username}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Email:</label>
                  <p className="form-control-plaintext">{user?.email}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Vai trò:</label>
                  <p>
                    <span className={`badge bg-${user?.role === 'ADMIN' ? 'danger' : 'primary'}`}>
                      {user?.role}
                    </span>
                  </p>
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  Tính năng cập nhật thông tin sẽ được phát triển trong phiên bản tiếp theo.
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body text-center">
                <i className="fas fa-user-circle fa-5x text-primary mb-3"></i>
                <h5>{user?.username}</h5>
                <p className="text-muted">{user?.email}</p>
                <span className={`badge bg-${user?.role === 'ADMIN' ? 'danger' : 'primary'} fs-6`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile




