package com.tmdt.shop_noithat_vp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reviews")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Review extends BaseEntity {
    
    // SỬA: Đổi sang EAGER để khi query Review sẽ lấy luôn thông tin User
    // Thêm JsonIgnoreProperties để tránh lỗi serialize các trường thừa của Hibernate
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "orders", "reviews", "hibernateLazyInitializer"}) 
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"reviews", "images", "hibernateLazyInitializer"})
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer"})
    private Order order; 
    
    @Column(nullable = false)
    private Integer rating; // 1-5 sao
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "is_approved")
    private Boolean isApproved = true; // Mặc định true để hiện ngay lập tức
    
    @Column(name = "review_images", columnDefinition = "TEXT")
    private String reviewImages;
}