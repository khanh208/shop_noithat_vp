package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Import này phải có
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
// === SỬA DÒNG DƯỚI ĐÂY: Thêm JpaSpecificationExecutor<Product> ===
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySku(String sku);
    Page<Product> findByIsActiveTrueAndIsDeletedFalse(Pageable pageable);
    Page<Product> findByCategoryIdAndIsActiveTrueAndIsDeletedFalse(Long categoryId, Pageable pageable);
    Page<Product> findByIsFeaturedTrueAndIsActiveTrueAndIsDeletedFalse(Pageable pageable);
    
    // Hàm này giữ lại cũng được, nhưng ta sẽ dùng Specification bên dưới nên hàm này không được gọi tới nữa
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.isDeleted = false " +
           "ORDER BY p.soldCount DESC")
    Page<Product> findBestSellingProducts(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.isDeleted = false " +
           "AND p.salePrice IS NOT NULL AND p.salePrice < p.price " +
           "ORDER BY (p.price - p.salePrice) DESC")
    Page<Product> findDiscountedProducts(Pageable pageable);
    
    List<Product> findByStockQuantityLessThanEqualAndIsDeletedFalse(Integer minStockLevel);
    long countByIsDeletedFalse();
    Page<Product> findByIsDeletedFalse(Pageable pageable);
}