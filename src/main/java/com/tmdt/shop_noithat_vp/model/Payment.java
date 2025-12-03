package com.tmdt.shop_noithat_vp.model;

import com.tmdt.shop_noithat_vp.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "payments")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Column(name = "transaction_id", unique = true)
    private String transactionId; // MoMo transaction ID
    
    @Column(name = "partner_code")
    private String partnerCode;
    
    @Column(name = "request_id")
    private String requestId;
    
    @Column(name = "amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "payment_method")
    private String paymentMethod; // MOMO, COD
    
    @Column(name = "response_time")
    private Long responseTime;
    
    @Column(name = "message")
    private String message;
    
    @Column(name = "pay_url")
    private String payUrl;
    
    @Column(name = "signature")
    private String signature;
    
    @Column(name = "callback_data", columnDefinition = "TEXT")
    private String callbackData; // Lưu toàn bộ callback từ MoMo
}



