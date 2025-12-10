package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.model.User; // Import User
import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import com.tmdt.shop_noithat_vp.model.enums.PaymentStatus;
import com.tmdt.shop_noithat_vp.repository.OrderRepository;
import com.tmdt.shop_noithat_vp.repository.UserRepository; // Import UserRepository
import com.tmdt.shop_noithat_vp.service.MoMoService;
import com.tmdt.shop_noithat_vp.service.WalletService; // Import WalletService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private MoMoService moMoService;

    @Autowired
    private OrderRepository orderRepository;

    // === THÊM 2 CÁI NÀY ĐỂ SỬA LỖI ===
    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;
    // ================================

    // API tạo link thanh toán ĐƠN HÀNG
    @PostMapping("/create-momo/{orderId}")
    public ResponseEntity<?> createMoMoPayment(@PathVariable Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            Map<String, Object> momoResponse = moMoService.createPayment(order);
            
            String resultCode = String.valueOf(momoResponse.get("resultCode"));
            if ("0".equals(resultCode)) {
                Map<String, Object> response = new HashMap<>();
                response.put("payUrl", momoResponse.get("payUrl"));
                response.put("orderId", order.getOrderCode());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(momoResponse);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // API tạo link NẠP TIỀN
    @PostMapping("/deposit-momo")
    public ResponseEntity<?> createDeposit(@RequestParam BigDecimal amount, @RequestParam Long userId) {
        try {
            String orderId = "TOPUP-" + userId + "-" + System.currentTimeMillis();
            
            // Gọi hàm mới trong MoMoService
            Map<String, Object> momoResponse = moMoService.createDepositPayment(orderId, amount);
            
            String resultCode = String.valueOf(momoResponse.get("resultCode"));
            if ("0".equals(resultCode)) {
                Map<String, Object> response = new HashMap<>();
                response.put("payUrl", momoResponse.get("payUrl"));
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(momoResponse);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Webhook IPN
    @PostMapping("/momo-ipn")
    public ResponseEntity<?> momoIPN(@RequestBody Map<String, Object> requestBody) {
        try {
            String resultCode = String.valueOf(requestBody.get("resultCode"));
            String orderIdStr = (String) requestBody.get("orderId");
            long amountLong = Long.parseLong(String.valueOf(requestBody.get("amount")));
            BigDecimal amount = BigDecimal.valueOf(amountLong);

            if ("0".equals(resultCode)) {
                if (orderIdStr.startsWith("TOPUP-")) {
                    // XỬ LÝ NẠP VÍ
                    String[] parts = orderIdStr.split("-");
                    Long userId = Long.parseLong(parts[1]);
                    User user = userRepository.findById(userId).orElseThrow();
                    
                    // Gọi WalletService để cộng tiền
                    walletService.deposit(user, amount, "Nạp tiền qua MoMo");
                } else {
                    // XỬ LÝ ĐƠN HÀNG
                    Order order = orderRepository.findByOrderCode(orderIdStr).orElseThrow();
                    if (order.getPaymentStatus() != PaymentStatus.SUCCESS) {
                        order.setPaymentStatus(PaymentStatus.SUCCESS);
                        order.setOrderStatus(OrderStatus.CONFIRMED);
                        orderRepository.save(order);
                    }
                }
            }
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}