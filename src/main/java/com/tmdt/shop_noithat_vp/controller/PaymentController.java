package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.repository.OrderRepository;
import com.tmdt.shop_noithat_vp.service.MoMoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import com.tmdt.shop_noithat_vp.model.enums.PaymentStatus;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private MoMoService moMoService;

    @Autowired
    private OrderRepository orderRepository;

    // ===================================
    // API TẠO LINK THANH TOÁN MOMO
    // ===================================
    @PostMapping("/create-momo/{orderId}")
    public ResponseEntity<?> createMoMoPayment(@PathVariable Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Gọi service MoMo để tạo payment
            Map<String, Object> momoResponse = moMoService.createPayment(order);

            // Kiểm tra kết quả
            String resultCode = String.valueOf(momoResponse.get("resultCode"));
            if ("0".equals(resultCode)) {
                // Thành công -> Trả về payUrl cho Frontend
                Map<String, Object> response = new HashMap<>();
                response.put("payUrl", momoResponse.get("payUrl"));
                response.put("orderId", order.getOrderCode());
                return ResponseEntity.ok(response);
            } else {
                // Lỗi từ MoMo
                return ResponseEntity.badRequest().body(momoResponse);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error creating MoMo payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ===================================
    // WEBHOOK - NHẬN THÔNG BÁO TỪ MOMO (IPN)
    // ===================================
    @PostMapping("/momo-ipn")
    public ResponseEntity<?> momoIPN(@RequestBody Map<String, Object> requestBody) {
        System.out.println("===== MoMo IPN Received =====");
        System.out.println("Request Body: " + requestBody);

        try {
            // 1. Lấy các thông tin từ MoMo
            String resultCode = String.valueOf(requestBody.get("resultCode"));
            String orderIdStr = (String) requestBody.get("orderId"); // Đây là orderCode
            
            System.out.println("Result Code: " + resultCode);
            System.out.println("Order ID: " + orderIdStr);
            
            // 2. Kiểm tra kết quả thanh toán
            if ("0".equals(resultCode)) {
                // Thanh toán thành công
                Order order = orderRepository.findByOrderCode(orderIdStr)
                        .orElseThrow(() -> new RuntimeException("Order not found: " + orderIdStr));

                // 3. Cập nhật trạng thái đơn hàng (chỉ cập nhật nếu chưa thành công)
                if (order.getPaymentStatus() != PaymentStatus.SUCCESS) {
                    order.setPaymentStatus(PaymentStatus.SUCCESS);
                    order.setOrderStatus(OrderStatus.CONFIRMED); // Tự động xác nhận đơn
                    orderRepository.save(order);
                    System.out.println("✓ Updated order " + orderIdStr + " to SUCCESS");
                } else {
                    System.out.println("⚠ Order " + orderIdStr + " already marked as SUCCESS");
                }
            } else {
                // Thanh toán thất bại
                System.out.println("✗ Payment failed for order: " + orderIdStr);
                
                Order order = orderRepository.findByOrderCode(orderIdStr).orElse(null);
                if (order != null) {
                    order.setPaymentStatus(PaymentStatus.FAILED);
                    orderRepository.save(order);
                }
            }

            // 4. Trả về 204 No Content theo chuẩn MoMo
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            e.printStackTrace();
            // Vẫn trả về 204 để MoMo không gửi lại
            return ResponseEntity.noContent().build();
        }
    }

    // ===================================
    // CALLBACK - REDIRECT TỪ TRANG MOMO VỀ
    // ===================================
    @GetMapping("/callback")
    public ResponseEntity<?> momoCallback(@RequestParam Map<String, String> params) {
        System.out.println("===== MoMo Callback Received =====");
        System.out.println("Params: " + params);

        String resultCode = params.get("resultCode");
        String message = params.get("message");
        
        // Redirect về Frontend với kết quả
        String frontendUrl = "http://localhost:3000/payment-result?resultCode=" 
                           + resultCode + "&message=" + message;
        
        return ResponseEntity.status(302)
                .header("Location", frontendUrl)
                .build();
    }
}