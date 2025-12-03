package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.dto.request.CreateProductRequest;
import com.tmdt.shop_noithat_vp.dto.request.UpdateProductRequest;
import com.tmdt.shop_noithat_vp.model.Category;
import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.model.Product;
import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.repository.CategoryRepository;
import com.tmdt.shop_noithat_vp.service.OrderService;
import com.tmdt.shop_noithat_vp.service.ProductService;
import com.tmdt.shop_noithat_vp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    // ==========================================
    // DASHBOARD STATS
    // ==========================================
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productService.countAllProducts());
        stats.put("totalOrders", orderService.countAllOrders());
        stats.put("totalRevenue", orderService.getTotalRevenue());
        stats.put("pendingOrders", orderService.countPendingOrders());
        return ResponseEntity.ok(stats);
    }
    
    // ==========================================
    // QUẢN LÝ SẢN PHẨM (PRODUCT)
    // ==========================================
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.getAllProductsForAdmin(pageable));
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductByIdForAdmin(id)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        return ResponseEntity.ok(product);
    }
    
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody CreateProductRequest request) {
        Product product = productService.createProduct(request);
        return ResponseEntity.ok(product);
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        Product product = productService.updateProduct(id, request);
        return ResponseEntity.ok(product);
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa sản phẩm thành công");
        return ResponseEntity.ok(response);
    }
    
    // ==========================================
    // QUẢN LÝ DANH MỤC (CATEGORY) - MỚI THÊM
    // ==========================================
    
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrueAndIsDeletedFalseOrderByDisplayOrderAsc());
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return ResponseEntity.ok(category);
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(generateSlug(category.getName()));
        }
        // Set giá trị mặc định
        if (category.getIsActive() == null) category.setIsActive(true);
        if (category.getDisplayOrder() == null) category.setDisplayOrder(0);
        category.setIsDeleted(false);
        
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setDisplayOrder(categoryDetails.getDisplayOrder());
        category.setIsActive(categoryDetails.getIsActive());
        
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setIsDeleted(true);
        categoryRepository.save(category);
        return ResponseEntity.ok().build();
    }
    
    // ==========================================
    // QUẢN LÝ ĐƠN HÀNG (ORDER)
    // ==========================================
    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(orders);
    }
    
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        Order order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }
    
    // ==========================================
    // QUẢN LÝ NGƯỜI DÙNG (USER)
    // ==========================================
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    // Helper function để tạo slug từ tên
    private String generateSlug(String name) {
        if (name == null) return "";
        String temp = Normalizer.normalize(name, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(temp).replaceAll("").toLowerCase();
        slug = slug.replaceAll("đ", "d");
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        return slug;
    }
}