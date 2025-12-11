package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
    
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus = :status AND o.isDeleted = false")
    Optional<BigDecimal> sumTotalAmountByOrderStatusAndIsDeletedFalse(@Param("status") OrderStatus status);

    // === CÁC QUERY CHO ANALYTICS (ĐÃ SỬA LỖI PARAMETER TYPE) ===

    // 1. Lấy danh sách đơn hàng ĐÃ GIAO trong khoảng thời gian
    @Query("SELECT o FROM Order o WHERE o.orderStatus = 'DELIVERED' AND o.isDeleted = false AND o.createdAt >= :start AND o.createdAt <= :end")
    List<Order> findDeliveredOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 2. Top sản phẩm bán chạy (Chỉ tính đơn DELIVERED)
    @Query("SELECT oi.product, SUM(oi.quantity), SUM(oi.totalPrice) " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.orderStatus = 'DELIVERED' AND o.isDeleted = false " +
           "AND o.createdAt >= :start AND o.createdAt <= :end " +
           "GROUP BY oi.product " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    // 3. Doanh thu theo danh mục (Chỉ tính đơn DELIVERED)
    @Query("SELECT p.category, SUM(oi.totalPrice), SUM(oi.quantity) " +
           "FROM OrderItem oi " +
           "JOIN oi.order o " +
           "JOIN oi.product p " +
           "WHERE o.orderStatus = 'DELIVERED' AND o.isDeleted = false " +
           "AND o.createdAt >= :start AND o.createdAt <= :end " +
           "GROUP BY p.category " +
           "ORDER BY SUM(oi.totalPrice) DESC")
    List<Object[]> findRevenueByCategory(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}