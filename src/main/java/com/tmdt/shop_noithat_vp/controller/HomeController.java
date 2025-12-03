package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Banner;
import com.tmdt.shop_noithat_vp.model.Product;
import com.tmdt.shop_noithat_vp.repository.BannerRepository;
import com.tmdt.shop_noithat_vp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class HomeController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private BannerRepository bannerRepository;
    
    @GetMapping({"/", "/home"})
    public String home(Model model) {
        // Get banners
        List<Banner> banners = bannerRepository.findByBannerTypeAndIsActiveTrueAndIsDeletedFalseOrderByDisplayOrderAsc("SLIDER");
        model.addAttribute("banners", banners);
        
        // Get featured products
        Pageable pageable = PageRequest.of(0, 8);
        Page<Product> featuredProducts = productService.getFeaturedProducts(pageable);
        model.addAttribute("featuredProducts", featuredProducts.getContent());
        
        // Get best selling products
        Page<Product> bestSellingProducts = productService.getBestSellingProducts(pageable);
        model.addAttribute("bestSellingProducts", bestSellingProducts.getContent());
        
        // Get discounted products
        Page<Product> discountedProducts = productService.getDiscountedProducts(pageable);
        model.addAttribute("discountedProducts", discountedProducts.getContent());
        
        return "home";
    }
}




