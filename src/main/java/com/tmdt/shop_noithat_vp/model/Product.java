package com.tmdt.shop_noithat_vp.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // Import quan trọng
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Product extends BaseEntity {
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "short_description", length = 500)
    private String shortDescription;
    
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;
    
    @Column(name = "sale_price", precision = 19, scale = 2)
    private BigDecimal salePrice;
    
    @Column(name = "sku", unique = true)
    private String sku;
    
    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;
    
    @Column(name = "min_stock_level")
    private Integer minStockLevel = 10;
    
    // Sử dụng EAGER để lấy luôn thông tin Category khi query Product, tránh lỗi Lazy loading
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Column(name = "brand")
    private String brand;
    
    @Column(name = "material")
    private String material;
    
    @Column(name = "color")
    private String color;
    
    @Column(name = "size")
    private String size;
    
    @Column(name = "weight")
    private Double weight;
    
    @Column(name = "dimensions")
    private String dimensions;
    
    @Column(name = "meta_title")
    private String metaTitle;
    
    @Column(name = "meta_description")
    private String metaDescription;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "view_count")
    private Long viewCount = 0L;
    
    @Column(name = "sold_count")
    private Long soldCount = 0L;
    
    // Giữ lại images để hiển thị ảnh sản phẩm (KHÔNG thêm @JsonIgnore)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductImage> images = new ArrayList<>();
    
    // === CÁC TRƯỜNG DƯỚI ĐÂY THÊM @JsonIgnore ĐỂ TRÁNH VÒNG LẶP VÔ TẬN ===
    
    @JsonIgnore
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews = new ArrayList<>();
    
    @JsonIgnore
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();
    
    @JsonIgnore // Quan trọng: Khắc phục lỗi hiển thị giỏ hàng
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CartItem> cartItems = new ArrayList<>();
    
    @JsonIgnore
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Wishlist> wishlists = new ArrayList<>();
}