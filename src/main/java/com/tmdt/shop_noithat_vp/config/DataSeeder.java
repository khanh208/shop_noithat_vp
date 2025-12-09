package com.tmdt.shop_noithat_vp.config;

import com.tmdt.shop_noithat_vp.model.Category;
import com.tmdt.shop_noithat_vp.model.Product;
import com.tmdt.shop_noithat_vp.model.ProductImage;
import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.model.enums.Role;
import com.tmdt.shop_noithat_vp.repository.CategoryRepository;
import com.tmdt.shop_noithat_vp.repository.ProductRepository;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) seedUsers();
        if (categoryRepository.count() == 0) seedCategories();
        if (productRepository.count() == 0) seedProducts();
    }
    
    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Administrator");
            admin.setPhoneNumber("0909000111");
            admin.setRole(Role.ADMIN);
            admin.setIsActive(true);
            admin.setIsEmailVerified(true);
            userRepository.save(admin);
        }
        if (!userRepository.existsByUsername("customer")) {
            User customer = new User();
            customer.setUsername("customer");
            customer.setEmail("customer@test.com");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setFullName("Nguyễn Văn Khách");
            customer.setPhoneNumber("0909000222");
            customer.setRole(Role.CUSTOMER);
            customer.setIsActive(true);
            customer.setIsEmailVerified(true);
            userRepository.save(customer);
        }
    }
    
    private void seedCategories() {
        createCat("Bàn làm việc", "ban-lam-viec", "Bàn làm việc văn phòng", 1);
        createCat("Ghế văn phòng", "ghe-van-phong", "Ghế ngồi làm việc", 2);
        createCat("Tủ hồ sơ", "tu-ho-so", "Tủ đựng tài liệu", 3);
        createCat("Kệ sách", "ke-sach", "Kệ để sách", 4);
    }

    private void createCat(String name, String slug, String desc, int order) {
        Category cat = new Category();
        cat.setName(name);
        cat.setSlug(slug);
        cat.setDescription(desc);
        cat.setIsActive(true);
        cat.setDisplayOrder(order);
        categoryRepository.save(cat);
    }
    
    private void seedProducts() {
        Category catBan = categoryRepository.findBySlug("ban-lam-viec").orElse(null);
        Category catGhe = categoryRepository.findBySlug("ghe-van-phong").orElse(null);
        Category catTu = categoryRepository.findBySlug("tu-ho-so").orElse(null);
        Category catKe = categoryRepository.findBySlug("ke-sach").orElse(null);
        
        // --- SỬ DỤNG ẢNH LOCAL (OFFLINE) ---
        // Lưu ý: Bạn phải đảm bảo tên file trong thư mục 'public/images/products' 
        // khớp chính xác với tên file bên dưới (ví dụ: ban-1.jpg)
        
        if (catBan != null) {
            createProduct(catBan, "Bàn làm việc gỗ sồi", "ban-lam-viec-go-soi", 
                "Bàn làm việc chất liệu gỗ tự nhiên cao cấp", 
                new BigDecimal("2500000"), new BigDecimal("2200000"), "BLV-001", 50, 
                "Furniture Pro", "Gỗ tự nhiên", "Nâu đậm", "120x60x75 cm", true,
                "/images/products/ban-1.jpg"); // Ảnh trong máy

            createProduct(catBan, "Bàn làm việc hiện đại", "ban-lam-viec-hien-dai", 
                "Bàn làm việc thiết kế hiện đại, màu trắng", 
                new BigDecimal("1800000"), null, "BLV-002", 30, 
                "Modern Desk", "MDF phủ melamine", "Trắng", "100x50x75 cm", true,
                "/images/products/ban-2.jpg");

            createProduct(catBan, "Bàn làm việc góc L", "ban-lam-viec-goc-l", 
                "Bàn làm việc góc L, tiết kiệm không gian", 
                new BigDecimal("3200000"), new BigDecimal("2800000"), "BLV-003", 25, 
                "Desk Pro", "Gỗ MDF", "Trắng/Gỗ", "140x140x75 cm", true,
                "/images/products/ban-3.jpg");
        }
        
        if (catGhe != null) {
            createProduct(catGhe, "Ghế văn phòng ergonomic", "ghe-van-phong-ergonomic", 
                "Ghế văn phòng thiết kế ergonomic, hỗ trợ lưng", 
                new BigDecimal("3200000"), new BigDecimal("2800000"), "GVP-001", 40, 
                "Comfort Seating", "Da PU", "Đen", null, true,
                "/images/products/ghe-1.jpg"); 

            createProduct(catGhe, "Ghế văn phòng xoay", "ghe-van-phong-xoay", 
                "Ghế văn phòng có thể xoay 360 độ", 
                new BigDecimal("1500000"), null, "GVP-002", 60, 
                "Office Chair", "Vải, nhựa", "Xám", null, true,
                "/images/products/ghe-2.jpg"); 
        }
        
        if (catTu != null) {
            createProduct(catTu, "Tủ hồ sơ 4 ngăn kéo", "tu-ho-so-4-ngan-keo", 
                "Tủ hồ sơ 4 ngăn kéo, chất liệu thép", 
                new BigDecimal("3500000"), new BigDecimal("3000000"), "THS-001", 25, 
                "Steel Cabinet", "Thép", "Xám", "90x40x180 cm", true,
                "/images/products/tu-1.jpg");
        }
        
        if (catKe != null) {
            createProduct(catKe, "Kệ sách 5 tầng", "ke-sach-5-tang", 
                "Kệ sách 5 tầng, chất liệu gỗ MDF", 
                new BigDecimal("2200000"), new BigDecimal("1900000"), "KS-001", 20, 
                "Book Shelf Pro", "MDF", "Nâu", "80x30x180 cm", true,
                "/images/products/ke-1.jpg");

            createProduct(catKe, "Kệ sách treo tường", "ke-sach-treo-tuong", 
                "Kệ sách treo tường, tiết kiệm không gian", 
                new BigDecimal("1200000"), null, "KS-002", 45, 
                "Wall Shelf", "Gỗ", "Tự nhiên", "100x25x15 cm", true,
                "/images/products/ke-2.jpg"); 
        }
    }
    
    private void createProduct(Category category, String name, String slug, String shortDesc,
                              BigDecimal price, BigDecimal salePrice, String sku, int stock,
                              String brand, String material, String color, String dimensions, 
                              boolean featured, String imageUrl) {
        Product product = new Product();
        product.setName(name);
        product.setSlug(slug);
        product.setShortDescription(shortDesc);
        product.setDescription(shortDesc);
        product.setPrice(price);
        product.setSalePrice(salePrice);
        product.setSku(sku);
        product.setStockQuantity(stock);
        product.setCategory(category);
        product.setBrand(brand);
        product.setMaterial(material);
        product.setColor(color);
        product.setDimensions(dimensions);
        product.setIsActive(true);
        product.setIsFeatured(featured);
        product.setViewCount(0L);
        product.setSoldCount(0L);
        
        ProductImage image = new ProductImage();
        image.setImageUrl(imageUrl);
        image.setIsPrimary(true);
        image.setDisplayOrder(1);
        image.setProduct(product);
        
        List<ProductImage> images = new ArrayList<>();
        images.add(image);
        product.setImages(images);
        
        productRepository.save(product);
    }
}