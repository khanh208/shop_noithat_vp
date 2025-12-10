package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@Service
public class MoMoService {

    // Sử dụng tên cấu hình khớp với application.properties
    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String momoEndpoint;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    /**
     * Tạo thanh toán cho ĐƠN HÀNG (Mua hàng)
     */
    public Map<String, Object> createPayment(Order order) throws Exception {
        String orderId = order.getOrderCode();
        String orderInfo = "Thanh toan don hang " + orderId;
        BigDecimal amount = order.getTotalAmount();
        
        // Gọi hàm chung để gửi request
        return sendRequestToMoMo(orderId, orderInfo, amount);
    }

    /**
     * Tạo thanh toán NẠP TIỀN VÀO VÍ (Deposit)
     */
    public Map<String, Object> createDepositPayment(String orderId, BigDecimal amount) throws Exception {
        String orderInfo = "Nap tien vao vi: " + orderId;
        
        // Gọi hàm chung để gửi request
        return sendRequestToMoMo(orderId, orderInfo, amount);
    }

    /**
     * Hàm chung xử lý logic tạo chữ ký và gửi request sang MoMo
     */
    private Map<String, Object> sendRequestToMoMo(String orderId, String orderInfo, BigDecimal amountVal) throws Exception {
        String requestId = String.valueOf(System.currentTimeMillis());
        String amount = String.valueOf(amountVal.longValue()); // MoMo yêu cầu số nguyên (VND)
        String requestType = "captureWallet";
        String extraData = ""; // Có thể để trống hoặc mã hóa thông tin thêm

        // 1. Tạo chuỗi Raw Signature (Quy tắc: sắp xếp a-z)
        String rawHash = "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

        // 2. Ký tên (HMAC SHA256)
        String signature = hmacSHA256(rawHash, secretKey);

        // 3. Tạo Request Body
        Map<String, String> map = new HashMap<>();
        map.put("partnerCode", partnerCode);
        map.put("partnerName", "Shop Noi That VP");
        map.put("storeId", "MomoTestStore");
        map.put("requestId", requestId);
        map.put("amount", amount);
        map.put("orderId", orderId);
        map.put("orderInfo", orderInfo);
        map.put("redirectUrl", redirectUrl);
        map.put("ipnUrl", ipnUrl);
        map.put("lang", "vi");
        map.put("extraData", extraData);
        map.put("requestType", requestType);
        map.put("signature", signature);

        // 4. Gửi Request sang MoMo API
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, String>> request = new HttpEntity<>(map, headers);
        
        // Nhận kết quả trả về
        return restTemplate.postForObject(momoEndpoint, request, Map.class);
    }

    // Hàm mã hóa HmacSHA256
    private String hmacSHA256(String data, String key) throws NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : rawHmac) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}