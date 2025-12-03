package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndIsApprovedTrueAndIsDeletedFalse(Long productId, Pageable pageable);
    Optional<Review> findByUserIdAndProductIdAndOrderId(Long userId, Long productId, Long orderId);
    List<Review> findByIsApprovedFalseAndIsDeletedFalse();
    long countByProductIdAndIsApprovedTrueAndIsDeletedFalse(Long productId);
}



