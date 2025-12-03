# Hướng dẫn Setup Ngrok với URL Cố Định

## Option 1: Ngrok Free (URL thay đổi mỗi lần)

**Nhược điểm**: URL thay đổi mỗi lần restart ngrok

**Cách dùng**:
```bash
ngrok http 8080
```

## Option 2: Ngrok với Authtoken (Cần đăng ký tài khoản miễn phí)

### Bước 1: Đăng ký tài khoản ngrok
1. Truy cập: https://dashboard.ngrok.com/signup
2. Đăng ký tài khoản miễn phí

### Bước 2: Lấy Authtoken
1. Đăng nhập vào https://dashboard.ngrok.com/
2. Vào mục "Your Authtoken"
3. Copy authtoken

### Bước 3: Cấu hình ngrok
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### Bước 4: Tạo file config (ngrok.yml)
Tạo file `ngrok.yml` trong thư mục home hoặc thư mục dự án:

```yaml
version: "2"
authtoken: YOUR_AUTHTOKEN
tunnels:
  shop:
    proto: http
    addr: 8080
    # Với tài khoản trả phí, có thể đặt domain tùy chỉnh:
    # domain: your-shop.ngrok.io
```

### Bước 5: Chạy ngrok với config
```bash
ngrok start shop
```

**Lưu ý**: Với tài khoản miễn phí, URL vẫn sẽ thay đổi. Chỉ có tài khoản trả phí mới có domain cố định.

## Option 3: LocalTunnel (Miễn phí, có subdomain tùy chỉnh)

### Cài đặt:
```bash
npm install -g localtunnel
```

### Chạy:
```bash
# URL ngẫu nhiên
lt --port 8080

# Subdomain tùy chỉnh (nếu còn trống)
lt --port 8080 --subdomain shop-noithat-vp
```

**URL sẽ có dạng**: `https://shop-noithat-vp.loca.lt`

## Option 4: Serveo (Miễn phí, qua SSH)

### Chạy:
```bash
ssh -R shop-noithat-vp:80:localhost:8080 serveo.net
```

**URL sẽ có dạng**: `https://shop-noithat-vp.serveo.net`

## Option 5: Cloudflare Tunnel (Miễn phí, tốt nhất)

### Cài đặt:
1. Tải cloudflared từ: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
2. Chạy:
```bash
cloudflared tunnel --url http://localhost:8080
```

**Ưu điểm**: 
- Miễn phí
- URL ổn định hơn
- Có thể dùng domain riêng nếu có

## Option 6: Deploy lên Server (Khuyến nghị cho Production)

### Sử dụng VPS/Cloud:
- **DigitalOcean**: $5/tháng
- **AWS EC2**: Free tier 12 tháng đầu
- **Google Cloud**: Free tier
- **Azure**: Free tier

### Sau khi deploy:
- Cấu hình domain thật
- Setup SSL/HTTPS (Let's Encrypt miễn phí)
- Không cần ngrok nữa

## Khuyến nghị

### Cho Development/Testing:
- **Ngrok Free**: Đơn giản, nhanh, nhưng URL thay đổi
- **LocalTunnel**: Miễn phí, có thể dùng subdomain

### Cho Production:
- **Deploy lên VPS**: Tốt nhất, có domain thật
- **Ngrok Paid**: Nếu cần tunnel nhanh với domain cố định

## Cập nhật application.properties

Sau khi có URL cố định (từ bất kỳ phương pháp nào), cập nhật:

```properties
momo.ipnUrl=https://your-stable-url.com/payment/webhook
```



