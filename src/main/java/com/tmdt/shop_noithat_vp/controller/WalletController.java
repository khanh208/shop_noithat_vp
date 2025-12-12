package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.WalletTransaction;
import com.tmdt.shop_noithat_vp.service.UserService;
import com.tmdt.shop_noithat_vp.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserService userService;

    @GetMapping("/transactions")
    public ResponseEntity<Page<WalletTransaction>> getTransactions(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = userService.getCurrentUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<WalletTransaction> transactions = walletService.getUserTransactions(userId, pageable);
        
        return ResponseEntity.ok(transactions);
    }
}