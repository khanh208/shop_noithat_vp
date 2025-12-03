package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.model.enums.PaymentMethod;
import com.tmdt.shop_noithat_vp.service.OrderService;
import com.tmdt.shop_noithat_vp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(
            @RequestParam String customerName,
            @RequestParam String customerPhone,
            @RequestParam String customerEmail,
            @RequestParam String shippingAddress,
            @RequestParam String shippingProvince,
            @RequestParam String shippingDistrict,
            @RequestParam String shippingWard,
            @RequestParam PaymentMethod paymentMethod,
            @RequestParam(required = false) String voucherCode,
            @RequestParam(required = false) String notes,
            Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        Order order = orderService.createOrder(userId, customerName, customerPhone, customerEmail,
                shippingAddress, shippingProvince, shippingDistrict, shippingWard,
                paymentMethod, voucherCode, notes);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping
    public ResponseEntity<Page<Order>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderService.getUserOrders(userId, pageable);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{orderCode}")
    public ResponseEntity<Order> getOrderByCode(@PathVariable String orderCode) {
        Order order = orderService.getOrderByCode(orderCode);
        return ResponseEntity.ok(order);
    }
}

