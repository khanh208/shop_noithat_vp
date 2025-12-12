package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tmdt.shop_noithat_vp.model.Voucher;

import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    @GetMapping("/active")
    public ResponseEntity<List<Voucher>> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getValidVouchers());
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkVoucher(
            @RequestParam String code,
            @RequestParam BigDecimal total) {
        try {
            Map<String, Object> result = voucherService.applyVoucher(code, total);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}