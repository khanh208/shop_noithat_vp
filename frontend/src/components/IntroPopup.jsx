import React from 'react'
import { useNavigate } from 'react-router-dom'

const IntroPopup = ({ bannerData, onClose }) => {
  const navigate = useNavigate()

  if (!bannerData) return null;

  const handleBannerClick = () => {
    if (bannerData.link) {
      onClose();
      navigate(bannerData.link);
    }
  }

  const imageUrl = bannerData.imageUrl && bannerData.imageUrl.startsWith('http') 
    ? bannerData.imageUrl 
    : `http://localhost:8082${bannerData.imageUrl}`;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        zIndex: 10000,
        backdropFilter: 'blur(3px)',
        padding: '20px' // Thêm padding để popup không dính sát mép màn hình điện thoại
      }}
    >
      <div 
        className="position-relative animate__animated animate__zoomIn shadow-lg rounded"
        style={{ 
          maxWidth: '600px', 
          width: '90%',
          // BỎ maxHeight ở đây để không hiện thanh cuộn
          // BỎ overflowY: 'auto'
          overflow: 'visible', // QUAN TRỌNG: Để nút X nằm ngoài khung không bị cắt
          backgroundColor: 'transparent',
          display: 'flex',       // Giúp căn chỉnh ảnh
          justifyContent: 'center'
        }}
      >
        {/* Nút tắt (X) */}
        <button 
          type="button" 
          className="btn btn-light rounded-circle shadow position-absolute d-flex align-items-center justify-content-center p-0" 
          onClick={onClose}
          style={{ 
            top: '-15px',    // Nằm nhô lên trên
            right: '-15px',  // Nằm nhô ra phải
            width: '35px', 
            height: '35px', 
            zIndex: 20,      // Cao hơn ảnh
            border: '2px solid white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-times text-dark"></i>
        </button>

        {/* Hình ảnh Banner */}
        <div 
          onClick={handleBannerClick} 
          style={{ 
            cursor: 'pointer', 
            borderRadius: '12px', 
            overflow: 'hidden',
            width: '100%' // Đảm bảo div bao quanh ảnh full width
          }}
        >
          <img 
            src={imageUrl}
            alt={bannerData.title} 
            className="img-fluid d-block mx-auto"
            style={{ 
              // Giới hạn chiều cao TRÊN ẢNH thay vì trên khung
              // Giúp ảnh tự thu nhỏ lại nếu màn hình thấp, không sinh ra thanh cuộn
              maxHeight: '80vh', 
              objectFit: 'contain',
              width: '100%'
            }} 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "https://placehold.co/600x400?text=Banner+Not+Found"
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default IntroPopup