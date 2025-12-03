package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByIsActiveTrueAndIsDeletedFalseOrderByDisplayOrderAsc();
    List<Banner> findByBannerTypeAndIsActiveTrueAndIsDeletedFalseOrderByDisplayOrderAsc(String bannerType);
}



