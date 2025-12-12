package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.dto.request.ReviewRequest;
import com.tmdt.shop_noithat_vp.model.Review;
import com.tmdt.shop_noithat_vp.service.ReviewService;
import com.tmdt.shop_noithat_vp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private UserService userService;

    // Gửi đánh giá
    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest request, Authentication authentication) {
        Long userId = userService.getCurrentUserId(authentication);
        Review review = reviewService.createReview(userId, request);
        return ResponseEntity.ok(review);
    }

    // Lấy danh sách đánh giá của sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<Review>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(reviewService.getProductReviews(productId, pageable));
    }
}