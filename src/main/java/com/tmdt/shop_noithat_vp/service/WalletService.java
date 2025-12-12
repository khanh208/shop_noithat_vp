package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.model.WalletTransaction;
import com.tmdt.shop_noithat_vp.model.enums.TransactionType;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import com.tmdt.shop_noithat_vp.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

@Service
public class WalletService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WalletTransactionRepository transactionRepository;

    // 1. Nạp tiền (Gọi khi MoMo báo thành công)
    @Transactional
    public void deposit(User user, BigDecimal amount, String description) {
        user.setBalance(user.getBalance().add(amount));
        userRepository.save(user);
        createTransaction(user, amount, TransactionType.DEPOSIT, description, null);
    }

    // 2. Thanh toán đơn hàng
    @Transactional
    public void payOrder(User user, BigDecimal amount, String orderCode) {
        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư ví không đủ!");
        }
        user.setBalance(user.getBalance().subtract(amount));
        userRepository.save(user);
        createTransaction(user, amount.negate(), TransactionType.PAYMENT, "Thanh toán đơn hàng " + orderCode, orderCode);
    }

    // 3. Hoàn tiền (Admin hủy đơn)
    @Transactional
    public void refund(User user, BigDecimal amount, String orderCode) {
        // Cộng tiền vào số dư hiện tại
        BigDecimal currentBalance = user.getBalance();
        user.setBalance(currentBalance.add(amount));
        
        // Lưu user
        userRepository.save(user);
        
        // Lưu lịch sử giao dịch
        createTransaction(user, amount, TransactionType.REFUND, "Hoàn tiền đơn hàng " + orderCode, orderCode);
    }

    private void createTransaction(User user, BigDecimal amount, TransactionType type, String desc, String orderCode) {
        WalletTransaction tx = new WalletTransaction();
        tx.setUser(user);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setDescription(desc);
        tx.setOrderCode(orderCode);
        tx.setStatus("SUCCESS");
        transactionRepository.save(tx);
    }
    public Page<WalletTransaction> getUserTransactions(Long userId, Pageable pageable) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
}