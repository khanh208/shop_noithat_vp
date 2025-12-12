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
import com.tmdt.shop_noithat_vp.model.Banner;
import com.tmdt.shop_noithat_vp.repository.BannerRepository;

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
    
    @Autowired
    private com.tmdt.shop_noithat_vp.repository.BannerRepository bannerRepository;
    @Autowired
    private com.tmdt.shop_noithat_vp.repository.VoucherRepository voucherRepository;
    
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
    // QUẢN LÝ DANH MỤC (CATEGORY) - ĐÃ CẬP NHẬT
    // ==========================================
    
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        // LƯU Ý QUAN TRỌNG: Sử dụng findByIsDeletedFalse... để hiển thị cả danh mục ẩn
        // Nếu dùng findByIsActiveTrue... thì Admin sẽ không thấy danh mục đang tắt
        return ResponseEntity.ok(categoryRepository.findByIsDeletedFalseOrderByDisplayOrderAsc());
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
        
        // Nếu muốn cập nhật cả slug khi tên thay đổi (tùy chọn)
        // if (!category.getName().equals(categoryDetails.getName())) {
        //     category.setSlug(generateSlug(categoryDetails.getName()));
        // }
        
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
        // Xóa dấu gạch ngang ở đầu hoặc cuối nếu có
        slug = slug.replaceAll("^-+|-+$", "");
        return slug;
    }
    // QUẢN LÝ BANNER (QUẢNG CÁO)
    // ==========================================
    
    @GetMapping("/banners")
    public ResponseEntity<List<com.tmdt.shop_noithat_vp.model.Banner>> getAllBanners() {
        // Lấy tất cả banner chưa bị xóa mềm, sắp xếp theo vị trí và thứ tự
        return ResponseEntity.ok(bannerRepository.findAll(org.springframework.data.domain.Sort.by("position", "displayOrder")));
    }

    @GetMapping("/banners/{id}")
    public ResponseEntity<com.tmdt.shop_noithat_vp.model.Banner> getBannerById(@PathVariable Long id) {
        com.tmdt.shop_noithat_vp.model.Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        return ResponseEntity.ok(banner);
    }

    @PostMapping("/banners")
    public ResponseEntity<com.tmdt.shop_noithat_vp.model.Banner> createBanner(@RequestBody com.tmdt.shop_noithat_vp.model.Banner banner) {
        // Set giá trị mặc định nếu null
        if (banner.getIsActive() == null) banner.setIsActive(true);
        if (banner.getDisplayOrder() == null) banner.setDisplayOrder(0);
        banner.setIsDeleted(false);
        
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<com.tmdt.shop_noithat_vp.model.Banner> updateBanner(@PathVariable Long id, @RequestBody com.tmdt.shop_noithat_vp.model.Banner bannerDetails) {
        com.tmdt.shop_noithat_vp.model.Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        
        banner.setTitle(bannerDetails.getTitle());
        banner.setImageUrl(bannerDetails.getImageUrl());
        banner.setLink(bannerDetails.getLink());
        banner.setPosition(bannerDetails.getPosition());
        banner.setDisplayOrder(bannerDetails.getDisplayOrder());
        banner.setStartDate(bannerDetails.getStartDate());
        banner.setEndDate(bannerDetails.getEndDate());
        banner.setIsActive(bannerDetails.getIsActive());
        
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        com.tmdt.shop_noithat_vp.model.Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        // Xóa cứng hoặc xóa mềm tùy nhu cầu, ở đây dùng xóa cứng cho gọn
        bannerRepository.delete(banner); 
        return ResponseEntity.ok().build();
    }
    // ==========================================
    // QUẢN LÝ VOUCHER
    // ==========================================
    
    @GetMapping("/vouchers")
    public ResponseEntity<List<com.tmdt.shop_noithat_vp.model.Voucher>> getAllVouchers() {
        // Lấy tất cả voucher, mới nhất lên đầu
        return ResponseEntity.ok(voucherRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id")));
    }

    @GetMapping("/vouchers/{id}")
    public ResponseEntity<com.tmdt.shop_noithat_vp.model.Voucher> getVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found")));
    }

    @PostMapping("/vouchers")
    public ResponseEntity<com.tmdt.shop_noithat_vp.model.Voucher> createVoucher(@RequestBody com.tmdt.shop_noithat_vp.model.Voucher voucher) {
        if (voucherRepository.findByCode(voucher.getCode()).isPresent()) {
            throw new RuntimeException("Mã voucher '" + voucher.getCode() + "' đã tồn tại!");
        }
        // Đảm bảo các giá trị mặc định
        if (voucher.getUsedCount() == null) voucher.setUsedCount(0);
        if (voucher.getIsActive() == null) voucher.setIsActive(true);
        if (voucher.getIsDeleted() == null) voucher.setIsDeleted(false);
        
        return ResponseEntity.ok(voucherRepository.save(voucher));
    }

    @PutMapping("/vouchers/{id}")
    public ResponseEntity<com.tmdt.shop_noithat_vp.model.Voucher> updateVoucher(@PathVariable Long id, @RequestBody com.tmdt.shop_noithat_vp.model.Voucher request) {
        com.tmdt.shop_noithat_vp.model.Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        
        // Không cho sửa Code để tránh lỗi logic, hoặc nếu sửa phải check trùng
        if (!voucher.getCode().equals(request.getCode()) && voucherRepository.findByCode(request.getCode()).isPresent()) {
             throw new RuntimeException("Mã voucher mới đã tồn tại!");
        }

        voucher.setCode(request.getCode());
        voucher.setName(request.getName());
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderAmount(request.getMinOrderAmount());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setIsActive(request.getIsActive());
        
        return ResponseEntity.ok(voucherRepository.save(voucher));
    }

    @DeleteMapping("/vouchers/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        com.tmdt.shop_noithat_vp.model.Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        // Xóa cứng
        voucherRepository.delete(voucher);
        return ResponseEntity.ok().build();
    }
}