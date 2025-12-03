package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Page<Wishlist> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);
    Optional<Wishlist> findByUserIdAndProductIdAndIsDeletedFalse(Long userId, Long productId);
    boolean existsByUserIdAndProductIdAndIsDeletedFalse(Long userId, Long productId);
}



