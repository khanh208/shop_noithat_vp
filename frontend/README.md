# Frontend React - Shop Nội Thất Văn Phòng

## Cài đặt và chạy

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn

### Cài đặt dependencies
```bash
cd frontend
npm install
```

### Chạy development server
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Build production
```bash
npm run build
```

## Tài khoản test

Sau khi backend chạy, các tài khoản test sẽ được tạo tự động:

1. **Admin:**
   - Username: `admin`
   - Password: `admin123`

2. **Customer:**
   - Username: `customer`
   - Password: `customer123`

3. **Test User:**
   - Username: `testuser`
   - Password: `test123`

## Cấu trúc dự án

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Home.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── services/        # API services
│   │   └── authService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Tính năng

- ✅ Đăng nhập bằng username/password
- ✅ Đăng ký tài khoản mới
- ✅ JWT Authentication
- ✅ Protected Routes
- ✅ OAuth2 (Google, Facebook) - tùy chọn



