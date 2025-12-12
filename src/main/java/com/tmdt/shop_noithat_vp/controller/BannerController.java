// File: src/main/java/com/tmdt/shop_noithat_vp/controller/BannerController.java

package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Banner;
import com.tmdt.shop_noithat_vp.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @GetMapping("/popup")
    public ResponseEntity<Banner> getPopupBanner() {
        // Lấy danh sách banner có position là 'POPUP' đang active
        List<Banner> banners = bannerRepository.findActiveBannersByPosition("POPUP", LocalDateTime.now());
        
        if (!banners.isEmpty()) {
            // Trả về banner ưu tiên nhất (display_order nhỏ nhất)
            return ResponseEntity.ok(banners.get(0)); 
        }
        return ResponseEntity.noContent().build();
    }
}