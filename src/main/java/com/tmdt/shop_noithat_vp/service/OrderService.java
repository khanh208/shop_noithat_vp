package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.*;
import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import com.tmdt.shop_noithat_vp.model.enums.PaymentMethod;
import com.tmdt.shop_noithat_vp.model.enums.PaymentStatus;
import com.tmdt.shop_noithat_vp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VoucherRepository voucherRepository;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private WalletService walletService; // Inject WalletService
    
    @Transactional
    public Order createOrder(Long userId, String customerName, String customerPhone, 
                             String customerEmail, String shippingAddress, String shippingProvince,
                             String shippingDistrict, String shippingWard, PaymentMethod paymentMethod,
                             String voucherCode, String notes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByUserIdAndIsDeletedFalse(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        Order order = new Order();
        String orderCode = "ORD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        order.setOrderCode(orderCode);
        order.setUser(user);
        order.setCustomerName(customerName);
        order.setCustomerPhone(customerPhone);
        order.setCustomerEmail(customerEmail);
        order.setShippingAddress(shippingAddress);
        order.setShippingProvince(shippingProvince);
        order.setShippingDistrict(shippingDistrict);
        order.setShippingWard(shippingWard);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setNotes(notes);
        
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            // Kiểm tra tồn kho trước
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ số lượng tồn kho!");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            orderItem.setProductName(product.getName());
            order.getOrderItems().add(orderItem);
            
            subtotal = subtotal.add(cartItem.getTotalPrice());
            
            // Trừ tồn kho
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            product.setSoldCount(product.getSoldCount() + cartItem.getQuantity());
            productRepository.save(product);
        }
        
        order.setSubtotal(subtotal);
        
        // Apply voucher
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (voucherCode != null && !voucherCode.isEmpty()) {
            Voucher voucher = voucherRepository.findByCode(voucherCode).orElse(null);
            if (voucher != null && isValidVoucher(voucher, subtotal)) {
                order.setVoucher(voucher);
                if ("PERCENTAGE".equals(voucher.getDiscountType())) {
                    discountAmount = subtotal.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
                    if (voucher.getMaxDiscountAmount() != null && discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                        discountAmount = voucher.getMaxDiscountAmount();
                    }
                } else {
                    discountAmount = voucher.getDiscountValue();
                }
                // Tăng số lần sử dụng voucher
                voucher.setUsedCount(voucher.getUsedCount() + 1);
                voucherRepository.save(voucher);
            }
        }
        order.setDiscountAmount(discountAmount);
        
        // Shipping fee
        BigDecimal shippingFee = calculateShippingFee(shippingProvince);
        order.setShippingFee(shippingFee);
        
        // Tổng tiền cuối cùng
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingFee);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;
        order.setTotalAmount(totalAmount);
        
        // === XỬ LÝ THANH TOÁN BẰNG VÍ ===
        if (paymentMethod == PaymentMethod.WALLET) {
            // Gọi WalletService để trừ tiền
            // Nếu không đủ tiền, walletService sẽ throw Exception -> Transaction Rollback (Đơn hàng không được tạo)
            walletService.payOrder(user, totalAmount, orderCode);
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            order.setOrderStatus(OrderStatus.CONFIRMED); // Tự động xác nhận nếu thanh toán luôn
        }
        // ================================
        
        order = orderRepository.save(order);
        
        // Xóa giỏ hàng
        cartItemRepository.deleteByUserId(userId);
        
        // Gửi mail xác nhận
        try {
            emailService.sendOrderConfirmationEmail(customerEmail, order.getOrderCode());
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
        
        return order;
    }

    // --- CÁC PHƯƠNG THỨC MỚI CHO HỦY VÀ HOÀN TIỀN ---

    /**
     * Khách hàng gửi yêu cầu hủy đơn
     */
    @Transactional
    public Order requestCancel(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Chỉ cho phép yêu cầu hủy khi đơn mới tạo hoặc đã xác nhận (chưa giao)
        if (order.getOrderStatus() == OrderStatus.PENDING || order.getOrderStatus() == OrderStatus.CONFIRMED) {
            order.setOrderStatus(OrderStatus.CANCEL_REQUEST);
            String oldNote = order.getNotes() != null ? order.getNotes() : "";
            order.setNotes(oldNote + " | [Lý do hủy]: " + reason);
            return orderRepository.save(order);
        } else {
            throw new RuntimeException("Không thể yêu cầu hủy đơn hàng ở trạng thái này (" + order.getOrderStatus() + ")");
        }
    }

    /**
     * Admin duyệt hủy đơn -> Hoàn tiền (nếu có) -> Hoàn tồn kho
     */
    @Transactional
    public Order approveCancel(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 1. Cập nhật trạng thái hủy
        order.setOrderStatus(OrderStatus.CANCELLED);

        // 2. Hoàn trả tồn kho (Restock)
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            product.setSoldCount(product.getSoldCount() - item.getQuantity()); // Giảm lượt bán ảo
            productRepository.save(product);
        }

        // 3. Hoàn tiền về Ví (Nếu đã thanh toán qua MOMO hoặc WALLET)
        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            walletService.refund(order.getUser(), order.getTotalAmount(), order.getOrderCode());
            order.setPaymentStatus(PaymentStatus.REFUNDED); // Cập nhật trạng thái tiền là "Đã hoàn"
        }

        return orderRepository.save(order);
    }

    /**
     * Admin từ chối hủy -> Quay lại trạng thái cũ (CONFIRMED)
     */
    @Transactional
    public Order rejectCancel(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.CANCEL_REQUEST) {
            // Quay về CONFIRMED để tiếp tục xử lý
            order.setOrderStatus(OrderStatus.CONFIRMED);
            String oldNote = order.getNotes() != null ? order.getNotes() : "";
            order.setNotes(oldNote + " | [Admin từ chối hủy]: " + reason);
            return orderRepository.save(order);
        } else {
            throw new RuntimeException("Đơn hàng không ở trạng thái yêu cầu hủy");
        }
    }

    // --- CÁC PHƯƠNG THỨC CŨ GIỮ NGUYÊN HOẶC TINH CHỈNH ---

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Nếu chuyển sang CANCELLED thủ công (không qua quy trình approveCancel)
        // Cũng nên gọi logic hoàn tiền/hoàn kho tương tự approveCancel
        if (status == OrderStatus.CANCELLED) {
            return approveCancel(orderId); 
        }

        order.setOrderStatus(status);
        
        // Nếu giao thành công -> Set đã thanh toán (cho trường hợp COD)
        if (status == OrderStatus.DELIVERED && order.getPaymentStatus() != PaymentStatus.SUCCESS) {
            order.setPaymentStatus(PaymentStatus.SUCCESS);
        }
        
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, String statusStr) {
        // Handle custom status strings from frontend if needed, or mapping
        try {
            OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
            return updateOrderStatus(orderId, status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status");
        }
    }

    // Helper methods
    private boolean isValidVoucher(Voucher voucher, BigDecimal orderValue) {
        return voucher.getIsActive() && 
               LocalDateTime.now().isAfter(voucher.getStartDate()) &&
               LocalDateTime.now().isBefore(voucher.getEndDate()) &&
               voucher.getUsedCount() < voucher.getUsageLimit() &&
               (voucher.getMinOrderAmount() == null || orderValue.compareTo(voucher.getMinOrderAmount()) >= 0);
    }

    private BigDecimal calculateShippingFee(String province) {
        return BigDecimal.valueOf(30000);
    }

    public Page<Order> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdAndIsDeletedFalse(userId, pageable);
    }
    
    public Order getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findByIsDeletedFalse(pageable);
    }
    
    public long countAllOrders() {
        return orderRepository.countByIsDeletedFalse();
    }
    
    public long countPendingOrders() {
        return orderRepository.countByOrderStatusAndIsDeletedFalse(OrderStatus.PENDING);
    }
    
    public BigDecimal getTotalRevenue() {
        return orderRepository.sumTotalAmountByOrderStatusAndIsDeletedFalse(OrderStatus.DELIVERED)
                .orElse(BigDecimal.ZERO);
    }
}