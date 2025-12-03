package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    Page<Order> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);
    Page<Order> findByOrderStatusAndIsDeletedFalse(OrderStatus status, Pageable pageable);
    Page<Order> findByIsDeletedFalse(Pageable pageable);
    List<Order> findByCreatedAtBetweenAndIsDeletedFalse(LocalDateTime start, LocalDateTime end);
    Page<Order> findByShipperIdAndIsDeletedFalse(Long shipperId, Pageable pageable);
    long countByIsDeletedFalse();
    long countByOrderStatusAndIsDeletedFalse(OrderStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus = :status AND o.isDeleted = false")
    java.util.Optional<java.math.BigDecimal> sumTotalAmountByOrderStatusAndIsDeletedFalse(OrderStatus status);
}

