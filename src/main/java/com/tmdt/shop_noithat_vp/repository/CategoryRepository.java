package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentIsNullAndIsDeletedFalse();
    List<Category> findByParentIdAndIsDeletedFalse(Long parentId);
    List<Category> findByIsActiveTrueAndIsDeletedFalseOrderByDisplayOrderAsc();
}




