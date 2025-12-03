# Hướng dẫn Setup và Test MoMo Sandbox

## Bước 1: Đăng ký tài khoản MoMo Developer

1. Truy cập: https://developers.momo.vn/
2. Đăng ký tài khoản developer
3. Tạo một ứng dụng mới (App)
4. Lấy thông tin:
   - **Partner Code**: Mã đối tác
   - **Access Key**: Khóa truy cập
   - **Secret Key**: Khóa bí mật

## Bước 2: Cấu hình trong ứng dụng

Cập nhật file `src/main/resources/application.properties`:

```properties
momo.partnerCode=MOMO_PARTNER_CODE
momo.accessKey=MOMO_ACCESS_KEY
momo.secretKey=MOMO_SECRET_KEY
momo.apiEndpoint=https://test-payment.momo.vn/v2/gateway/api/create
momo.redirectUrl=http://localhost:8080/payment/callback
momo.ipnUrl=http://your-ngrok-url.ngrok.io/payment/webhook
```

## Bước 3: Cài đặt và chạy Ngrok

### Windows:
1. Tải Ngrok từ: https://ngrok.com/download
2. Giải nén file
3. Mở Command Prompt hoặc PowerShell
4. Chạy lệnh:
```bash
ngrok http 8080
```

### Mac/Linux:
```bash
# Cài đặt qua Homebrew (Mac)
brew install ngrok

# Hoặc tải từ website
# Sau đó chạy:
ngrok http 8080
```

### Lấy URL từ Ngrok:
Sau khi chạy Ngrok, bạn sẽ thấy output như:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8080
```

Copy URL `https://abc123.ngrok.io` và cập nhật vào `momo.ipnUrl` trong `application.properties`.

**Lưu ý**: URL Ngrok thay đổi mỗi lần restart (trừ khi dùng tài khoản trả phí). Cần cập nhật lại `momo.ipnUrl` mỗi lần.

## Bước 4: Test thanh toán

1. Khởi động ứng dụng:
```bash
mvn spring-boot:run
```

2. Tạo đơn hàng thông qua API hoặc giao diện web

3. Chọn thanh toán MoMo

4. Sẽ được redirect đến trang thanh toán MoMo Sandbox

5. Đăng nhập với tài khoản test:
   - Số điện thoại: Số điện thoại đã đăng ký trong MoMo Developer Portal
   - Mật khẩu: Mật khẩu test (xem trong Developer Portal)

6. Xác nhận thanh toán

7. Hệ thống sẽ nhận callback và cập nhật trạng thái đơn hàng

## Bước 5: Kiểm tra Webhook

1. Đảm bảo Ngrok đang chạy
2. Kiểm tra log của ứng dụng để xem webhook có được nhận không
3. Kiểm tra database để xem payment status đã được cập nhật chưa

## Troubleshooting

### Lỗi: "Invalid signature"
- Kiểm tra lại Secret Key
- Đảm bảo signature được tính đúng theo format của MoMo

### Lỗi: "Webhook không nhận được"
- Kiểm tra Ngrok đang chạy
- Kiểm tra URL trong `momo.ipnUrl` đúng chưa
- Kiểm tra firewall/antivirus có chặn không

### Lỗi: "Redirect URL không đúng"
- Kiểm tra `momo.redirectUrl` trong application.properties
- Đảm bảo URL đúng format và accessible

## Tài khoản Test MoMo

Trong môi trường Sandbox, bạn có thể sử dụng:
- Số điện thoại test: Xem trong Developer Portal
- Mật khẩu test: Xem trong Developer Portal
- Số tiền test: Có thể test với bất kỳ số tiền nào

## Chuyển sang Production

Khi chuyển sang production:
1. Thay đổi `momo.apiEndpoint` thành production endpoint
2. Sử dụng Partner Code, Access Key, Secret Key của production
3. Cập nhật `momo.redirectUrl` và `momo.ipnUrl` thành domain thật
4. Không cần Ngrok nữa (chỉ dùng cho development)



