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
        order.setOrderCode("ORD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
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
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            orderItem.setProductName(cartItem.getProduct().getName());
            order.getOrderItems().add(orderItem);
            subtotal = subtotal.add(cartItem.getTotalPrice());
            
            // Update product stock
            Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            product.setSoldCount(product.getSoldCount() + cartItem.getQuantity());
            productRepository.save(product);
        }
        
        order.setSubtotal(subtotal);
        
        // Apply voucher if provided
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (voucherCode != null && !voucherCode.isEmpty()) {
            Voucher voucher = voucherRepository.findByCode(voucherCode)
                    .orElse(null);
            if (voucher != null && voucher.getIsActive() && 
                LocalDateTime.now().isAfter(voucher.getStartDate()) &&
                LocalDateTime.now().isBefore(voucher.getEndDate()) &&
                voucher.getUsedCount() < voucher.getUsageLimit()) {
                order.setVoucher(voucher);
                if ("PERCENTAGE".equals(voucher.getDiscountType())) {
                    discountAmount = subtotal.multiply(voucher.getDiscountValue())
                            .divide(BigDecimal.valueOf(100));
                    if (voucher.getMaxDiscountAmount() != null && 
                        discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
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
        
        // Calculate shipping fee (simplified)
        BigDecimal shippingFee = calculateShippingFee(shippingProvince);
        order.setShippingFee(shippingFee);
        
        order.setTotalAmount(subtotal.subtract(discountAmount).add(shippingFee));
        
        order = orderRepository.save(order);
        
        // Clear cart
        cartItemRepository.deleteByUserId(userId);
        
        // Send confirmation email
        try {
            emailService.sendOrderConfirmationEmail(customerEmail, order.getOrderCode());
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
        
        return order;
    }
    
    public Page<Order> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdAndIsDeletedFalse(userId, pageable);
    }
    
    public Order getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus(status);
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        return updateOrderStatus(orderId, orderStatus);
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
    
    private BigDecimal calculateShippingFee(String province) {
        // Simplified shipping fee calculation
        // In real application, this should be more sophisticated
        return BigDecimal.valueOf(30000); // Default 30,000 VND
    }
}

