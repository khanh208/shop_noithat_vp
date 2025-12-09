package com.tmdt.shop_noithat_vp.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // <-- Thêm import
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_images")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage extends BaseEntity {
    
    @JsonIgnore // <-- THÊM DÒNG NÀY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false;
}