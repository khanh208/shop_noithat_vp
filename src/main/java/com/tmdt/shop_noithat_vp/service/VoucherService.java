package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.Voucher;
import com.tmdt.shop_noithat_vp.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    public Map<String, Object> applyVoucher(String code, BigDecimal orderTotal) {
        Optional<Voucher> voucherOpt = voucherRepository.findByCode(code);
        
        if (voucherOpt.isEmpty()) {
            throw new RuntimeException("Mã giảm giá không tồn tại!");
        }

        Voucher voucher = voucherOpt.get();

        // 1. Kiểm tra hiệu lực
        if (!voucher.getIsActive()) {
            throw new RuntimeException("Mã giảm giá đã bị khóa!");
        }

        // 2. Kiểm tra thời gian
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getStartDate())) {
            throw new RuntimeException("Mã giảm giá chưa đến đợt áp dụng!");
        }
        if (now.isAfter(voucher.getEndDate())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn!");
        }

        // 3. Kiểm tra số lượng sử dụng
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng!");
        }

        // 4. Kiểm tra giá trị đơn hàng tối thiểu
        if (voucher.getMinOrderAmount() != null && orderTotal.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu: " + voucher.getMinOrderAmount() + " đ");
        }

        // 5. Tính toán số tiền giảm
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
            // Giảm theo phần trăm
            discountAmount = orderTotal.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
            
            // Kiểm tra mức giảm tối đa (nếu có)
            if (voucher.getMaxDiscountAmount() != null && discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discountAmount = voucher.getMaxDiscountAmount();
            }
        } else {
            // Giảm tiền cố định
            discountAmount = voucher.getDiscountValue();
        }

        // Đảm bảo không giảm quá giá trị đơn hàng
        if (discountAmount.compareTo(orderTotal) > 0) {
            discountAmount = orderTotal;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("discountAmount", discountAmount);
        result.put("voucherCode", voucher.getCode());
        result.put("finalTotal", orderTotal.subtract(discountAmount));
        
        return result;
    }
}