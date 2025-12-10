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
    private WalletService walletService;
    
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
                voucher.setUsedCount(voucher.getUsedCount() + 1);
                voucherRepository.save(voucher);
            }
        }
        order.setDiscountAmount(discountAmount);
        
        BigDecimal shippingFee = calculateShippingFee(shippingProvince);
        order.setShippingFee(shippingFee);
        
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingFee);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;
        order.setTotalAmount(totalAmount);
        
        // === XỬ LÝ THANH TOÁN BẰNG VÍ ===
        if (paymentMethod == PaymentMethod.WALLET) {
            walletService.payOrder(user, totalAmount, orderCode);
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            order.setOrderStatus(OrderStatus.CONFIRMED);
        }
        
        order = orderRepository.save(order);
        cartItemRepository.deleteByUserId(userId);
        
        try {
            emailService.sendOrderConfirmationEmail(customerEmail, order.getOrderCode());
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
        
        return order;
    }

    /**
     * Khách hàng gửi yêu cầu hủy đơn
     */
    @Transactional
    public Order requestCancel(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.PENDING || order.getOrderStatus() == OrderStatus.CONFIRMED) {
            order.setOrderStatus(OrderStatus.CANCEL_REQUESTED);
            String oldNote = order.getNotes() != null ? order.getNotes() : "";
            order.setNotes(oldNote + " | [Lý do hủy]: " + reason);
            return orderRepository.save(order);
        } else {
            throw new RuntimeException("Không thể yêu cầu hủy đơn hàng ở trạng thái này (" + order.getOrderStatus() + ")");
        }
    }

    /**
     * ===== SỬA LỖI Ở ĐÂY =====
     * Admin duyệt hủy đơn -> Hoàn tiền (nếu thanh toán qua VÍ hoặc MOMO) -> Hoàn tồn kho
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
            product.setSoldCount(product.getSoldCount() - item.getQuantity());
            productRepository.save(product);
        }

        // 3. === SỬA LỖI: HOÀN TIỀN VỀ VÍ ===
        // Chỉ hoàn tiền nếu đã thanh toán THÀNH CÔNG và thanh toán qua WALLET hoặc MOMO
        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            // Kiểm tra phương thức thanh toán
            PaymentMethod paymentMethod = order.getPaymentMethod();
            
            if (paymentMethod == PaymentMethod.WALLET || paymentMethod == PaymentMethod.MOMO) {
                // Hoàn tiền về ví user
                walletService.refund(order.getUser(), order.getTotalAmount(), order.getOrderCode());
                order.setPaymentStatus(PaymentStatus.REFUNDED);
                
                System.out.println("✅ Đã hoàn " + order.getTotalAmount() + " VND vào ví user " + order.getUser().getUsername());
            } else if (paymentMethod == PaymentMethod.COD) {
                // COD không cần hoàn tiền về ví (vì chưa thu tiền)
                order.setPaymentStatus(PaymentStatus.REFUNDED); // Đánh dấu là đã xử lý
                System.out.println("ℹ️ Đơn COD - Không cần hoàn tiền về ví");
            }
        } else {
            // Nếu chưa thanh toán (PENDING/FAILED) -> Chỉ hủy đơn, không hoàn tiền
            System.out.println("ℹ️ Đơn hàng chưa thanh toán - Chỉ hủy đơn, không hoàn tiền");
        }

        return orderRepository.save(order);
    }

    /**
     * Admin từ chối hủy -> Quay lại trạng thái cũ
     */
    @Transactional
    public Order rejectCancel(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.CANCEL_REQUESTED) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
            String oldNote = order.getNotes() != null ? order.getNotes() : "";
            order.setNotes(oldNote + " | [Admin từ chối hủy]: " + reason);
            return orderRepository.save(order);
        } else {
            throw new RuntimeException("Đơn hàng không ở trạng thái yêu cầu hủy");
        }
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Nếu chuyển sang CANCELLED thủ công -> Gọi approveCancel
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