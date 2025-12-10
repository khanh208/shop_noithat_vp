package com.tmdt.shop_noithat_vp.model;

import com.tmdt.shop_noithat_vp.model.enums.TransactionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal amount; // Số tiền biến động

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // DEPOSIT (Nạp), PAYMENT (Thanh toán), REFUND (Hoàn tiền)

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "order_code")
    private String orderCode; // Mã đơn hàng liên quan (nếu có)

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "transaction_status")
    private String status; // SUCCESS, FAILED
}