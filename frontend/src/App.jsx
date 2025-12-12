import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import VerifyEmail from './components/VerifyEmail'
import Home from './components/Home'
import Products from './components/Products'
import ProductDetail from './components/ProductDetail'
import DiscountedProducts from './components/DiscountedProducts'
import Cart from './components/Cart'
import Orders from './components/Orders'
import OrderDetail from './components/OrderDetail'
import Profile from './components/Profile'
import Checkout from './components/Checkout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminProducts from './components/admin/AdminProducts'
import AdminOrders from './components/admin/AdminOrders'
import AdminProductForm from './components/admin/AdminProductForm'
import AdminCategories from './components/admin/AdminCategories'
import AdminCategoryForm from './components/admin/AdminCategoryForm'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import PaymentResult from './components/PaymentResult'
import Wallet from './components/Wallet'
import AdminOrderDetail from './components/admin/AdminOrderDetail'
import AdminBanners from './components/admin/AdminBanners'
import AdminBannerForm from './components/admin/AdminBannerForm'
import AdminVouchers from './components/admin/AdminVouchers'
import AdminVoucherForm from './components/admin/AdminVoucherForm'
import Wishlist from './components/Wishlist'
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* === PUBLIC ROUTES (Ai cũng có thể truy cập) === */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Các trang xem sản phẩm -> Public */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/discounted" element={<DiscountedProducts />} />

          {/* === PROTECTED ROUTES (Phải đăng nhập mới vào được) === */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:orderCode" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/payment-result" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />    
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />  

          {/* === ADMIN ROUTES === */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
          <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/orders/:orderCode" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/categories/new" element={<AdminRoute><AdminCategoryForm /></AdminRoute>} />
          <Route path="/admin/categories/:id/edit" element={<AdminRoute><AdminCategoryForm /></AdminRoute>} />
          <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
          <Route path="/admin/banners/new" element={<AdminRoute><AdminBannerForm /></AdminRoute>} />
          <Route path="/admin/banners/:id/edit" element={<AdminRoute><AdminBannerForm /></AdminRoute>} />
          <Route path="/admin/vouchers" element={<AdminRoute><AdminVouchers /></AdminRoute>} />
          <Route path="/admin/vouchers/new" element={<AdminRoute><AdminVoucherForm /></AdminRoute>} />
          <Route path="/admin/vouchers/:id/edit" element={<AdminRoute><AdminVoucherForm /></AdminRoute>} />

          {/* === DEFAULT REDIRECT === */}
          {/* Nếu đường dẫn sai, chuyển về trang chủ thay vì login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App