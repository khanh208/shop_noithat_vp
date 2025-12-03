package com.tmdt.shop_noithat_vp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "blog_posts")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class BlogPost extends BaseEntity {
    
    @Column(nullable = false)
    private String title;
    
    @Column(unique = true)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "short_description", length = 500)
    private String shortDescription;
    
    @Column(name = "featured_image")
    private String featuredImage;
    
    @Column(name = "meta_title")
    private String metaTitle;
    
    @Column(name = "meta_description")
    private String metaDescription;
    
    @Column(name = "meta_keywords")
    private String metaKeywords;
    
    @Column(name = "is_published")
    private Boolean isPublished = false;
    
    @Column(name = "view_count")
    private Long viewCount = 0L;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;
    
    @ManyToMany
    @JoinTable(
        name = "blog_post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<BlogTag> tags = new ArrayList<>();
}




