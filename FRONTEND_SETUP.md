# Hướng dẫn Setup Frontend React

## Tổng quan

Frontend React đã được tạo với các tính năng:
- ✅ Đăng nhập bằng username/password (không bắt buộc OAuth2)
- ✅ Đăng ký tài khoản mới
- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ Tích hợp với backend Spring Boot

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Chạy development server

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### 3. Đảm bảo backend đang chạy

Backend Spring Boot phải chạy tại: `http://localhost:8080`

## Tài khoản test

Khi backend khởi động, `DataSeeder` sẽ tự động tạo các tài khoản test:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | ADMIN |
| `customer` | `customer123` | CUSTOMER |
| `testuser` | `test123` | CUSTOMER |

## Cấu trúc Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Form đăng nhập username/password
│   │   ├── Register.jsx       # Form đăng ký
│   │   ├── Home.jsx            # Trang chủ sau khi đăng nhập
│   │   └── ProtectedRoute.jsx # Component bảo vệ route
│   ├── context/
│   │   └── AuthContext.jsx     # Context quản lý authentication
│   ├── services/
│   │   └── authService.js      # Service gọi API backend
│   ├── App.jsx                 # Component chính
│   ├── main.jsx                # Entry point
│   └── index.css               # CSS global
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Tính năng đăng nhập

### Đăng nhập bằng username/password

Form đăng nhập hỗ trợ:
- Đăng nhập bằng username hoặc email
- Mật khẩu được hash và lưu trong database
- JWT token được lưu trong localStorage
- Tự động redirect sau khi đăng nhập thành công

### OAuth2 (Tùy chọn)

Nếu muốn sử dụng OAuth2, có thể click vào các nút:
- Đăng nhập với Google
- Đăng nhập với Facebook

**Lưu ý:** OAuth2 chỉ hoạt động nếu đã cấu hình trong `application.properties`

## API Endpoints

Frontend gọi các API sau:

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

## CORS Configuration

Backend đã được cấu hình để cho phép requests từ:
- `http://localhost:3000` (React frontend)
- `http://localhost:8080` (Backend)

## Build Production

```bash
npm run build
```

Files sẽ được build vào thư mục `dist/`

## Troubleshooting

### Lỗi CORS
- Đảm bảo backend đang chạy tại `http://localhost:8080`
- Kiểm tra `SecurityConfig.java` đã cho phép `http://localhost:3000`

### Không kết nối được API
- Kiểm tra backend đã start chưa
- Kiểm tra URL trong `authService.js` có đúng không
- Mở DevTools (F12) để xem lỗi chi tiết

### Token không hợp lệ
- Xóa token trong localStorage: `localStorage.removeItem('token')`
- Đăng nhập lại



