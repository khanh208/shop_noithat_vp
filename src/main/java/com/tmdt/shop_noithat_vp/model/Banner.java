// File: src/main/java/com/tmdt/shop_noithat_vp/model/Banner.java
package com.tmdt.shop_noithat_vp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Banner extends BaseEntity {
    
    @Column(nullable = false)
    private String title;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    @Column(name = "link")
    private String link;
    
    @Column(name = "position") 
    private String position; 
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}