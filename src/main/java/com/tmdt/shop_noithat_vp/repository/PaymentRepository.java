package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Payment;
import com.tmdt.shop_noithat_vp.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByRequestId(String requestId);
}




