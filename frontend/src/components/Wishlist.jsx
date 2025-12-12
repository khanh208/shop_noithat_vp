import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import { wishlistService } from '../services/wishlistService'

const Wishlist = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      const data = await wishlistService.getWishlist(0, 100)
      setItems(data.content || [])
    } catch (error) {
      console.error('Lỗi tải wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
        await wishlistService.toggleWishlist(productId)
        // Load lại danh sách sau khi xóa
        loadWishlist()
    } catch (error) {
        alert("Lỗi khi xóa sản phẩm")
    }
  }

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ'

  if (loading) return (
    <div className="min-vh-100 bg-light"><Navigation /><div className="text-center mt-5"><div className="spinner-border"></div></div></div>
  )

  return (
    <div className="min-vh-100 bg-light">
      <Navigation />
      <div className="container my-4">
        <h2 className="mb-4 text-danger"><i className="fas fa-heart me-2"></i>Sản phẩm yêu thích</h2>
        
        {items.length === 0 ? (
            <div className="text-center py-5">
                <i className="far fa-heart fa-3x text-muted mb-3"></i>
                <p>Bạn chưa có sản phẩm yêu thích nào.</p>
                <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
            </div>
        ) : (
            <div className="row g-4">
                {items.map(({ product }) => (
                    <div key={product.id} className="col-md-3 col-sm-6">
                        <div className="card h-100 shadow-sm">
                            <Link to={`/products/${product.slug || product.id}`}>
                                <img 
                                    src={product.images?.[0]?.imageUrl || 'https://placehold.co/300x200'} 
                                    className="card-img-top" 
                                    alt={product.name}
                                    style={{height: '200px', objectFit: 'cover'}} 
                                />
                            </Link>
                            <div className="card-body">
                                <h6 className="card-title text-truncate">
                                    <Link to={`/products/${product.slug || product.id}`} className="text-decoration-none text-dark">
                                        {product.name}
                                    </Link>
                                </h6>
                                <p className="card-text text-danger fw-bold">{formatPrice(product.salePrice || product.price)}</p>
                                <button 
                                    className="btn btn-outline-danger btn-sm w-100"
                                    onClick={() => handleRemove(product.id)}
                                >
                                    <i className="fas fa-trash me-1"></i> Bỏ thích
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist