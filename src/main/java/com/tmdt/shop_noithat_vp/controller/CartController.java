package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.CartItem;
import com.tmdt.shop_noithat_vp.service.CartService;
import com.tmdt.shop_noithat_vp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems(Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        List<CartItem> items = cartService.getCartItems(userId);
        return ResponseEntity.ok(items);
    }
    
    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        CartItem item = cartService.addToCart(userId, productId, quantity);
        return ResponseEntity.ok(item);
    }
    
    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItem> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        CartItem item = cartService.updateCartItem(userId, cartItemId, quantity);
        return ResponseEntity.ok(item);
    }
    
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        cartService.removeFromCart(userId, cartItemId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getCartTotal(Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        BigDecimal total = cartService.getCartTotal(userId);
        return ResponseEntity.ok(total);
    }
}

