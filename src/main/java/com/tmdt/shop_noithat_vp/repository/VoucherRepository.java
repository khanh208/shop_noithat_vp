package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);
    List<Voucher> findByIsActiveTrueAndStartDateBeforeAndEndDateAfterAndIsDeletedFalse(
        LocalDateTime now1, LocalDateTime now2);
}




