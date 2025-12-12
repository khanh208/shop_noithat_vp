package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.dto.request.ReviewRequest;
import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.model.Product;
import com.tmdt.shop_noithat_vp.model.Review;
import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import com.tmdt.shop_noithat_vp.repository.OrderRepository;
import com.tmdt.shop_noithat_vp.repository.ProductRepository;
import com.tmdt.shop_noithat_vp.repository.ReviewRepository;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Review createReview(Long userId, ReviewRequest request) {
        // 1. Kiểm tra đơn hàng có tồn tại và thuộc về user không
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
                
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền đánh giá đơn hàng này");
        }

        // 2. QUAN TRỌNG: Kiểm tra trạng thái đơn hàng phải là DELIVERED
        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Chỉ đơn hàng đã giao thành công mới được đánh giá");
        }

        // 3. Kiểm tra sản phẩm có trong đơn hàng không
        boolean hasProduct = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(request.getProductId()));
        if (!hasProduct) {
            throw new RuntimeException("Sản phẩm không có trong đơn hàng này");
        }

        // 4. Kiểm tra đã đánh giá chưa (tránh spam)
        Optional<Review> existingReview = reviewRepository.findByUserIdAndProductIdAndOrderId(
                userId, request.getProductId(), request.getOrderId());
        if (existingReview.isPresent()) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi");
        }

        // 5. Lưu đánh giá
        User user = userRepository.findById(userId).orElseThrow();
        Product product = productRepository.findById(request.getProductId()).orElseThrow();

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setOrder(order);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setIsApproved(true); // Tự động duyệt hoặc set false nếu cần admin duyệt

        return reviewRepository.save(review);
    }

    public Page<Review> getProductReviews(Long productId, Pageable pageable) {
        return reviewRepository.findByProductIdAndIsApprovedTrueAndIsDeletedFalse(productId, pageable);
    }
}