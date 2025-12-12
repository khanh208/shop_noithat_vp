package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.Product;
import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.model.Wishlist;
import com.tmdt.shop_noithat_vp.repository.ProductRepository;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import com.tmdt.shop_noithat_vp.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public Page<Wishlist> getUserWishlist(Long userId, Pageable pageable) {
        return wishlistRepository.findByUserIdAndIsDeletedFalse(userId, pageable);
    }

    @Transactional
    public String toggleWishlist(Long userId, Long productId) {
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductIdAndIsDeletedFalse(userId, productId);

        if (existing.isPresent()) {
            // Nếu đã có -> Xóa (Bỏ thích)
            // Lưu ý: Có thể dùng xóa cứng (delete) hoặc xóa mềm (isDeleted=true)
            // Ở đây dùng xóa cứng cho gọn database
            wishlistRepository.delete(existing.get());
            return "removed";
        } else {
            // Nếu chưa có -> Thêm mới
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

            Wishlist wishlist = new Wishlist();
            wishlist.setUser(user);
            wishlist.setProduct(product);
            wishlistRepository.save(wishlist);
            return "added";
        }
    }

    public boolean checkProductInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductIdAndIsDeletedFalse(userId, productId);
    }
}