// File: src/main/java/com/tmdt/shop_noithat_vp/repository/BannerRepository.java
package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    
    // Hàm tìm Banner theo vị trí và thời gian (Sửa lỗi undefined method)
    @Query("SELECT b FROM Banner b WHERE b.position = :position " +
           "AND b.isActive = true AND b.isDeleted = false " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate >= :now) " +
           "ORDER BY b.displayOrder ASC")
    List<Banner> findActiveBannersByPosition(String position, LocalDateTime now);
}