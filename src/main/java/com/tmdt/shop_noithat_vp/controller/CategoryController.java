package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Category;
import com.tmdt.shop_noithat_vp.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        // Lấy danh sách danh mục đang hiển thị (Active) cho người dùng
        // Lưu ý: Đảm bảo bạn đã có hàm này trong CategoryRepository
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrueAndIsDeletedFalseOrderByDisplayOrderAsc());
    }
}