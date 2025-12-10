package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    
    // Tìm lịch sử giao dịch của 1 user (Sắp xếp mới nhất trước)
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Tìm lịch sử giao dịch của 1 user có phân trang
    Page<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Tìm theo mã đơn hàng (để kiểm tra xem đơn này đã hoàn tiền chưa, v.v.)
    WalletTransaction findByOrderCode(String orderCode);
}