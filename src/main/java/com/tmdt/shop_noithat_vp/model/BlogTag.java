package com.tmdt.shop_noithat_vp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "blog_tags")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class BlogTag extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String name;
    
    @Column(unique = true)
    private String slug;
}




