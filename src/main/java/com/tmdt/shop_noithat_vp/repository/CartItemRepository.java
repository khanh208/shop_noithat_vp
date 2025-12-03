package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserIdAndIsDeletedFalse(Long userId);
    Optional<CartItem> findByUserIdAndProductIdAndIsDeletedFalse(Long userId, Long productId);
    void deleteByUserId(Long userId);
    long countByUserIdAndIsDeletedFalse(Long userId);
}



