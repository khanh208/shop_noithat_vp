package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    Optional<BlogPost> findBySlug(String slug);
    Page<BlogPost> findByIsPublishedTrueAndIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
}



