package com.tmdt.shop_noithat_vp.model;

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
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order; // Để xác minh đã mua hàng
    
    @Column(nullable = false)
    private Integer rating; // 1-5 sao
    
    @Column(columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "is_approved")
    private Boolean isApproved = false;
    
    @Column(name = "review_images", columnDefinition = "TEXT")
    private String reviewImages; // JSON array of image URLs
}



