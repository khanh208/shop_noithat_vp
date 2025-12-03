package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySku(String sku);
    Page<Product> findByIsActiveTrueAndIsDeletedFalse(Pageable pageable);
    Page<Product> findByCategoryIdAndIsActiveTrueAndIsDeletedFalse(Long categoryId, Pageable pageable);
    Page<Product> findByIsFeaturedTrueAndIsActiveTrueAndIsDeletedFalse(Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.isDeleted = false " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:minPrice IS NULL OR p.salePrice >= :minPrice OR (p.salePrice IS NULL AND p.price >= :minPrice)) " +
           "AND (:maxPrice IS NULL OR p.salePrice <= :maxPrice OR (p.salePrice IS NULL AND p.price <= :maxPrice)) " +
           "AND (:brand IS NULL OR p.brand = :brand) " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("brand") String brand,
        @Param("keyword") String keyword,
        Pageable pageable
    );
    
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

