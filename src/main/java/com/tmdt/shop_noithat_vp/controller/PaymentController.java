package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.repository.OrderRepository;
import com.tmdt.shop_noithat_vp.service.MoMoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import com.tmdt.shop_noithat_vp.model.enums.PaymentStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private MoMoService moMoService;

    @Autowired
    private OrderRepository orderRepository;

    // API tạo link thanh toán MoMo
    @PostMapping("/momo-ipn")
    public ResponseEntity<?> momoIPN(@RequestBody Map<String, Object> requestBody) {
        // Log dữ liệu MoMo gửi về để debug (nếu cần)
        System.out.println("MoMo IPN received: " + requestBody);

        try {
            // 1. Lấy các thông tin quan trọng
            String resultCode = String.valueOf(requestBody.get("resultCode"));
            String orderIdStr = (String) requestBody.get("orderId"); // Đây là orderCode
            
            // 2. Kiểm tra kết quả
            if ("0".equals(resultCode)) {
                // Thanh toán thành công
                // Tìm đơn hàng dựa trên orderCode (Lưu ý: trong MoMoService ta gửi orderCode vào trường orderId)
                Order order = orderRepository.findByOrderCode(orderIdStr)
                        .orElseThrow(() -> new RuntimeException("Order not found: " + orderIdStr));

                // 3. Cập nhật trạng thái đơn hàng
                if (order.getPaymentStatus() != PaymentStatus.SUCCESS) {
                    order.setPaymentStatus(PaymentStatus.SUCCESS);
                    order.setOrderStatus(OrderStatus.CONFIRMED); // Tự động xác nhận đơn
                    orderRepository.save(order);
                    System.out.println("✓ Cập nhật đơn hàng " + orderIdStr + " thành công.");
                }
            } else {
                System.out.println("✗ Thanh toán thất bại cho đơn: " + orderIdStr);
            }

            // 4. Trả về 204 No Content theo chuẩn MoMo để báo đã nhận tin
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}