package com.tmdt.shop_noithat_vp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vouchers")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Voucher extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "discount_type", nullable = false)
    private String discountType; // PERCENTAGE, FIXED_AMOUNT
    
    @Column(name = "discount_value", precision = 19, scale = 2, nullable = false)
    private BigDecimal discountValue;
    
    @Column(name = "min_order_amount", precision = 19, scale = 2)
    private BigDecimal minOrderAmount;
    
    @Column(name = "max_discount_amount", precision = 19, scale = 2)
    private BigDecimal maxDiscountAmount;
    
    @Column(name = "usage_limit")
    private Integer usageLimit; // Tổng số lần sử dụng
    
    @Column(name = "used_count")
    private Integer usedCount = 0;
    
    @Column(name = "user_limit")
    private Integer userLimit = 1; // Số lần mỗi user được dùng
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @ManyToMany
    @JoinTable(
        name = "voucher_categories",
        joinColumns = @JoinColumn(name = "voucher_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> applicableCategories = new ArrayList<>();
    
    @ManyToMany
    @JoinTable(
        name = "voucher_products",
        joinColumns = @JoinColumn(name = "voucher_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> applicableProducts = new ArrayList<>();
    
    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();
}




