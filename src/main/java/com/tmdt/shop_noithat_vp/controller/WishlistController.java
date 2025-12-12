package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Wishlist;
import com.tmdt.shop_noithat_vp.service.UserService;
import com.tmdt.shop_noithat_vp.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Page<Wishlist>> getMyWishlist(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = userService.getCurrentUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId, pageable));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<Map<String, String>> toggleWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        Long userId = userService.getCurrentUserId(authentication);
        String action = wishlistService.toggleWishlist(userId, productId);
        
        Map<String, String> response = new HashMap<>();
        response.put("action", action);
        response.put("message", action.equals("added") ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> checkWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        Long userId = userService.getCurrentUserId(authentication);
        return ResponseEntity.ok(wishlistService.checkProductInWishlist(userId, productId));
    }
}