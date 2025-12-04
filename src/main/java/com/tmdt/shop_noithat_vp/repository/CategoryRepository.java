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
    
    // Phương thức cũ (dành cho user - chỉ lấy category đang active)
    List<Category> findByIsActiveTrueAndIsDeletedFalseOrderByDisplayOrderAsc();

    // === THÊM DÒNG NÀY ĐỂ SỬA LỖI GẠCH ĐỎ TRONG HÌNH ===
    // Phương thức mới (dành cho admin - lấy tất cả category chưa bị xóa mềm)
    List<Category> findByIsDeletedFalseOrderByDisplayOrderAsc();
}