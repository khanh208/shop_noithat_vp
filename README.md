# Ứng dụng Mua Sắm Trực Tuyến - Sản Phẩm Nội Thất Văn Phòng

## Mô tả dự án

Ứng dụng web mua sắm trực tuyến cho sản phẩm nội thất văn phòng được xây dựng bằng Java Spring Boot, PostgreSQL, và tích hợp thanh toán MoMo Sandbox.

## Công nghệ sử dụng

- **Backend**: Java 21, Spring Boot 4.0.0
- **Database**: PostgreSQL
- **Security**: Spring Security, JWT
- **Payment**: MoMo Sandbox
- **Frontend**: Thymeleaf, Bootstrap 5
- **Build Tool**: Maven

## Tính năng chính

### Phía Người dùng (Customer)
- ✅ Đăng ký / Đăng nhập (JWT, OAuth2 Google/Facebook)
- ✅ Trang chủ với banner, sản phẩm nổi bật, bán chạy
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Chi tiết sản phẩm
- ✅ Giỏ hàng
- ✅ Thanh toán (COD, MoMo)
- ✅ Quản lý đơn hàng
- ✅ Đánh giá sản phẩm
- ✅ Wishlist
- ✅ Blog/Tin tức

### Phía Admin
- ✅ Quản lý sản phẩm, danh mục
- ✅ Quản lý đơn hàng
- ✅ Quản lý kho hàng
- ✅ Quản lý người dùng và phân quyền
- ✅ Quản lý voucher
- ✅ Quản lý banner
- ✅ Báo cáo doanh thu

## Cài đặt và Chạy dự án

### Yêu cầu hệ thống

- Java 21+
- Maven 3.8+
- PostgreSQL 12+
- Ngrok (để test MoMo callback)

### Bước 1: Clone và cấu hình Database

1. Tạo database PostgreSQL:
```sql
CREATE DATABASE shop_noithat_vp;
```

2. Cập nhật thông tin database trong `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shop_noithat_vp
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### Bước 2: Cấu hình MoMo Sandbox

1. Đăng ký tài khoản tại [MoMo Developer Portal](https://developers.momo.vn/)
2. Tạo app và lấy thông tin:
   - Partner Code
   - Access Key
   - Secret Key
3. Cập nhật trong `application.properties`:
```properties
momo.partnerCode=YOUR_PARTNER_CODE
momo.accessKey=YOUR_ACCESS_KEY
momo.secretKey=YOUR_SECRET_KEY
momo.apiEndpoint=https://test-payment.momo.vn/v2/gateway/api/create
momo.redirectUrl=http://localhost:8080/payment/callback
momo.ipnUrl=http://your-ngrok-url.ngrok.io/payment/webhook
```

### Bước 3: Cấu hình Email (Optional)

Cập nhật thông tin email trong `application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### Bước 4: Cấu hình OAuth2 (Optional)

1. Tạo OAuth2 credentials cho Google và Facebook
2. Cập nhật trong `application.properties`:
```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

spring.security.oauth2.client.registration.facebook.client-id=YOUR_FACEBOOK_CLIENT_ID
spring.security.oauth2.client.registration.facebook.client-secret=YOUR_FACEBOOK_CLIENT_SECRET
```

### Bước 5: Cấu hình Ngrok cho MoMo Webhook

1. Cài đặt Ngrok: https://ngrok.com/download
2. Chạy Ngrok:
```bash
ngrok http 8080
```
3. Copy URL từ Ngrok (ví dụ: `https://abc123.ngrok.io`)
4. Cập nhật `momo.ipnUrl` trong `application.properties`:
```properties
momo.ipnUrl=https://abc123.ngrok.io/payment/webhook
```

### Bước 6: Build và chạy dự án

```bash
# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Hoặc chạy trực tiếp:
```bash
java -jar target/shop_noithat_vp-0.0.1-SNAPSHOT.jar
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

## Cấu trúc dự án

```
src/main/java/com/tmdt/shop_noithat_vp/
├── config/          # Cấu hình (Security, etc.)
├── controller/      # Controllers (API và Web)
├── dto/            # Data Transfer Objects
├── model/          # Entity models
│   └── enums/      # Enumerations
├── repository/     # JPA Repositories
├── security/       # Security components
├── service/        # Business logic
└── util/           # Utility classes
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/verify?token=...` - Xác thực email

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `GET /api/products/slug/{slug}` - Chi tiết sản phẩm theo slug
- `GET /api/products/featured` - Sản phẩm nổi bật
- `GET /api/products/best-selling` - Sản phẩm bán chạy
- `GET /api/products/search` - Tìm kiếm sản phẩm

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/add?productId=...&quantity=...` - Thêm vào giỏ
- `PUT /api/cart/{cartItemId}?quantity=...` - Cập nhật số lượng
- `DELETE /api/cart/{cartItemId}` - Xóa khỏi giỏ
- `GET /api/cart/total` - Tổng tiền giỏ hàng

### Orders
- `POST /api/orders/create` - Tạo đơn hàng
- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/{orderCode}` - Chi tiết đơn hàng

### Payment
- `POST /payment/momo/create/{orderId}` - Tạo thanh toán MoMo
- `GET /payment/callback` - Callback từ MoMo
- `POST /payment/webhook` - Webhook từ MoMo

## Tạo tài khoản Admin

Sau khi chạy ứng dụng, bạn có thể tạo tài khoản admin bằng cách:

1. Đăng ký tài khoản thông thường
2. Cập nhật role trong database:
```sql
UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
```

## Phân quyền

- **ADMIN**: Toàn quyền quản trị
- **SALES**: Quản lý đơn hàng, khách hàng
- **WAREHOUSE**: Quản lý kho hàng
- **SHIPPER**: Quản lý vận chuyển
- **MARKETING**: Quản lý banner, voucher, blog
- **CUSTOMER**: Người dùng thông thường

## Lưu ý quan trọng

1. **MoMo Sandbox**: Chỉ dùng để test, không phải môi trường production
2. **JWT Secret**: Thay đổi `jwt.secret` trong production
3. **Database**: Sử dụng `spring.jpa.hibernate.ddl-auto=update` chỉ trong development
4. **Ngrok**: URL thay đổi mỗi lần restart, cần cập nhật lại `momo.ipnUrl`

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đã chạy chưa
- Kiểm tra username/password trong `application.properties`

### Lỗi MoMo payment
- Kiểm tra thông tin Partner Code, Access Key, Secret Key
- Đảm bảo Ngrok đang chạy và URL đúng
- Kiểm tra log để xem chi tiết lỗi

### Lỗi email
- Kiểm tra App Password (không dùng mật khẩu Gmail thông thường)
- Bật "Less secure app access" hoặc dùng App Password

## Tác giả

Nguyen Quoc Khanh

## License

MIT License




