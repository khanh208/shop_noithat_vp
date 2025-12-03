package com.tmdt.shop_noithat_vp.config;

import com.tmdt.shop_noithat_vp.model.Category;
import com.tmdt.shop_noithat_vp.model.Product;
import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.model.enums.Role;
import com.tmdt.shop_noithat_vp.repository.CategoryRepository;
import com.tmdt.shop_noithat_vp.repository.ProductRepository;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import com.tmdt.shop_noithat_vp.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Data Seeder - Tạo dữ liệu test ban đầu
 * Chạy tự động khi ứng dụng khởi động
 */
@Component
public class DataSeeder implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCategories();
        seedProducts();
    }
    
    private void seedUsers() {
        // Tạo user admin test
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@test.com");
            admin.setPassword(PasswordUtil.hashPassword("admin123"));
            admin.setFullName("Administrator");
            admin.setPhoneNumber("0123456789");
            admin.setRole(Role.ADMIN);
            admin.setIsActive(true);
            admin.setIsEmailVerified(true);
            userRepository.save(admin);
            System.out.println("✓ Đã tạo user admin (username: admin, password: admin123)");
        }
        
        // Tạo user customer test
        if (!userRepository.existsByUsername("customer")) {
            User customer = new User();
            customer.setUsername("customer");
            customer.setEmail("customer@test.com");
            customer.setPassword(PasswordUtil.hashPassword("customer123"));
            customer.setFullName("Customer Test");
            customer.setPhoneNumber("0987654321");
            customer.setRole(Role.CUSTOMER);
            customer.setIsActive(true);
            customer.setIsEmailVerified(true);
            userRepository.save(customer);
            System.out.println("✓ Đã tạo user customer (username: customer, password: customer123)");
        }
        
        // Tạo user test khác
        if (!userRepository.existsByUsername("testuser")) {
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setEmail("testuser@test.com");
            testUser.setPassword(PasswordUtil.hashPassword("test123"));
            testUser.setFullName("Test User");
            testUser.setPhoneNumber("0111222333");
            testUser.setRole(Role.CUSTOMER);
            testUser.setIsActive(true);
            testUser.setIsEmailVerified(true);
            userRepository.save(testUser);
            System.out.println("✓ Đã tạo user testuser (username: testuser, password: test123)");
        }
    }
    
    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            Category cat1 = new Category();
            cat1.setName("Bàn làm việc");
            cat1.setSlug("ban-lam-viec");
            cat1.setDescription("Bàn làm việc văn phòng cao cấp");
            cat1.setIsActive(true);
            cat1.setDisplayOrder(1);
            categoryRepository.save(cat1);
            
            Category cat2 = new Category();
            cat2.setName("Ghế văn phòng");
            cat2.setSlug("ghe-van-phong");
            cat2.setDescription("Ghế ngồi làm việc ergonomic");
            cat2.setIsActive(true);
            cat2.setDisplayOrder(2);
            categoryRepository.save(cat2);
            
            Category cat3 = new Category();
            cat3.setName("Tủ hồ sơ");
            cat3.setSlug("tu-ho-so");
            cat3.setDescription("Tủ đựng tài liệu và hồ sơ");
            cat3.setIsActive(true);
            cat3.setDisplayOrder(3);
            categoryRepository.save(cat3);
            
            Category cat4 = new Category();
            cat4.setName("Kệ sách");
            cat4.setSlug("ke-sach");
            cat4.setDescription("Kệ để sách và tài liệu");
            cat4.setIsActive(true);
            cat4.setDisplayOrder(4);
            categoryRepository.save(cat4);
            
            System.out.println("✓ Đã tạo 4 categories");
        }
    }
    
    private void seedProducts() {
        if (productRepository.count() == 0) {
            Category cat1 = categoryRepository.findBySlug("ban-lam-viec").orElse(null);
            Category cat2 = categoryRepository.findBySlug("ghe-van-phong").orElse(null);
            Category cat3 = categoryRepository.findBySlug("tu-ho-so").orElse(null);
            Category cat4 = categoryRepository.findBySlug("ke-sach").orElse(null);
            
            if (cat1 != null) {
                // Bàn làm việc 1
                Product p1 = new Product();
                p1.setName("Bàn làm việc gỗ cao cấp");
                p1.setSlug("ban-lam-viec-go-cao-cap");
                p1.setDescription("Bàn làm việc chất liệu gỗ tự nhiên, thiết kế hiện đại, phù hợp cho văn phòng");
                p1.setShortDescription("Bàn làm việc gỗ tự nhiên cao cấp");
                p1.setPrice(new BigDecimal("2500000"));
                p1.setSalePrice(new BigDecimal("2200000"));
                p1.setSku("BLV-001");
                p1.setStockQuantity(50);
                p1.setCategory(cat1);
                p1.setBrand("Furniture Pro");
                p1.setMaterial("Gỗ tự nhiên");
                p1.setColor("Nâu đậm");
                p1.setDimensions("120x60x75 cm");
                p1.setIsActive(true);
                p1.setIsFeatured(true);
                productRepository.save(p1);
                
                // Bàn làm việc 2
                Product p2 = new Product();
                p2.setName("Bàn làm việc hiện đại");
                p2.setSlug("ban-lam-viec-hien-dai");
                p2.setDescription("Bàn làm việc thiết kế hiện đại, màu trắng, có ngăn kéo tiện lợi");
                p2.setShortDescription("Bàn làm việc thiết kế hiện đại");
                p2.setPrice(new BigDecimal("1800000"));
                p2.setSku("BLV-002");
                p2.setStockQuantity(30);
                p2.setCategory(cat1);
                p2.setBrand("Modern Desk");
                p2.setMaterial("MDF phủ melamine");
                p2.setColor("Trắng");
                p2.setDimensions("100x50x75 cm");
                p2.setIsActive(true);
                productRepository.save(p2);
            }
            
            if (cat2 != null) {
                // Ghế văn phòng 1
                Product p3 = new Product();
                p3.setName("Ghế văn phòng ergonomic");
                p3.setSlug("ghe-van-phong-ergonomic");
                p3.setDescription("Ghế văn phòng thiết kế ergonomic, hỗ trợ lưng tốt, có thể điều chỉnh độ cao");
                p3.setShortDescription("Ghế văn phòng ergonomic cao cấp");
                p3.setPrice(new BigDecimal("3200000"));
                p3.setSalePrice(new BigDecimal("2800000"));
                p3.setSku("GVP-001");
                p3.setStockQuantity(40);
                p3.setCategory(cat2);
                p3.setBrand("Comfort Seating");
                p3.setMaterial("Da PU, khung thép");
                p3.setColor("Đen");
                p3.setIsActive(true);
                p3.setIsFeatured(true);
                productRepository.save(p3);
                
                // Ghế văn phòng 2
                Product p4 = new Product();
                p4.setName("Ghế văn phòng xoay");
                p4.setSlug("ghe-van-phong-xoay");
                p4.setDescription("Ghế văn phòng có thể xoay 360 độ, đệm ngồi êm ái");
                p4.setShortDescription("Ghế văn phòng xoay tiện lợi");
                p4.setPrice(new BigDecimal("1500000"));
                p4.setSku("GVP-002");
                p4.setStockQuantity(60);
                p4.setCategory(cat2);
                p4.setBrand("Office Chair");
                p4.setMaterial("Vải, nhựa");
                p4.setColor("Xám");
                p4.setIsActive(true);
                productRepository.save(p4);
            }
            
            if (cat3 != null) {
                // Tủ hồ sơ 1
                Product p5 = new Product();
                p5.setName("Tủ hồ sơ 4 ngăn kéo");
                p5.setSlug("tu-ho-so-4-ngan-keo");
                p5.setDescription("Tủ hồ sơ 4 ngăn kéo, chất liệu thép, có khóa an toàn");
                p5.setShortDescription("Tủ hồ sơ 4 ngăn kéo tiện lợi");
                p5.setPrice(new BigDecimal("3500000"));
                p5.setSalePrice(new BigDecimal("3000000"));
                p5.setSku("THS-001");
                p5.setStockQuantity(25);
                p5.setCategory(cat3);
                p5.setBrand("Steel Cabinet");
                p5.setMaterial("Thép");
                p5.setColor("Xám");
                p5.setDimensions("90x40x180 cm");
                p5.setIsActive(true);
                p5.setIsFeatured(true);
                productRepository.save(p5);
                
                // Tủ hồ sơ 2
                Product p6 = new Product();
                p6.setName("Tủ hồ sơ 2 ngăn");
                p6.setSlug("tu-ho-so-2-ngan");
                p6.setDescription("Tủ hồ sơ 2 ngăn kéo, kích thước nhỏ gọn");
                p6.setShortDescription("Tủ hồ sơ 2 ngăn nhỏ gọn");
                p6.setPrice(new BigDecimal("1800000"));
                p6.setSku("THS-002");
                p6.setStockQuantity(35);
                p6.setCategory(cat3);
                p6.setBrand("Compact Cabinet");
                p6.setMaterial("Thép");
                p6.setColor("Trắng");
                p6.setDimensions("60x40x120 cm");
                p6.setIsActive(true);
                productRepository.save(p6);
            }
            
            if (cat4 != null) {
                // Kệ sách 1
                Product p7 = new Product();
                p7.setName("Kệ sách 5 tầng");
                p7.setSlug("ke-sach-5-tang");
                p7.setDescription("Kệ sách 5 tầng, chất liệu gỗ MDF, thiết kế đẹp mắt");
                p7.setShortDescription("Kệ sách 5 tầng hiện đại");
                p7.setPrice(new BigDecimal("2200000"));
                p7.setSalePrice(new BigDecimal("1900000"));
                p7.setSku("KS-001");
                p7.setStockQuantity(20);
                p7.setCategory(cat4);
                p7.setBrand("Book Shelf Pro");
                p7.setMaterial("MDF");
                p7.setColor("Nâu");
                p7.setDimensions("80x30x180 cm");
                p7.setIsActive(true);
                productRepository.save(p7);
                
                // Kệ sách 2
                Product p8 = new Product();
                p8.setName("Kệ sách treo tường");
                p8.setSlug("ke-sach-treo-tuong");
                p8.setDescription("Kệ sách treo tường, tiết kiệm không gian, thiết kế độc đáo");
                p8.setShortDescription("Kệ sách treo tường tiết kiệm không gian");
                p8.setPrice(new BigDecimal("1200000"));
                p8.setSku("KS-002");
                p8.setStockQuantity(45);
                p8.setCategory(cat4);
                p8.setBrand("Wall Shelf");
                p8.setMaterial("Gỗ");
                p8.setColor("Tự nhiên");
                p8.setDimensions("100x25x15 cm");
                p8.setIsActive(true);
                productRepository.save(p8);
            }
            
            // Thêm nhiều sản phẩm hơn
            if (cat1 != null) {
                // Bàn làm việc 3-6
                createProduct(cat1, "Bàn làm việc góc L", "ban-lam-viec-goc-l", "Bàn làm việc góc L, tiết kiệm không gian", 
                    new BigDecimal("3200000"), new BigDecimal("2800000"), "BLV-003", 25, "Desk Pro", "Gỗ MDF", "Trắng", "140x140x75 cm", true);
                createProduct(cat1, "Bàn làm việc có giá sách", "ban-lam-viec-co-gia-sach", "Bàn làm việc kết hợp giá sách tiện lợi", 
                    new BigDecimal("3800000"), null, "BLV-004", 15, "Smart Desk", "Gỗ", "Nâu", "120x60x180 cm", false);
                createProduct(cat1, "Bàn làm việc gỗ sồi", "ban-lam-viec-go-soi", "Bàn làm việc gỗ sồi tự nhiên cao cấp", 
                    new BigDecimal("4500000"), new BigDecimal("4000000"), "BLV-005", 10, "Premium Wood", "Gỗ sồi", "Tự nhiên", "150x70x75 cm", true);
                createProduct(cat1, "Bàn làm việc compact", "ban-lam-viec-compact", "Bàn làm việc nhỏ gọn cho không gian hẹp", 
                    new BigDecimal("1200000"), null, "BLV-006", 40, "Compact", "MDF", "Xám", "80x50x75 cm", false);
            }
            
            if (cat2 != null) {
                // Ghế văn phòng 3-6
                createProduct(cat2, "Ghế văn phòng gaming", "ghe-van-phong-gaming", "Ghế văn phòng gaming cao cấp", 
                    new BigDecimal("4500000"), new BigDecimal("3900000"), "GVP-003", 20, "Gaming Pro", "Da PU", "Đen/Đỏ", null, true);
                createProduct(cat2, "Ghế văn phòng mesh", "ghe-van-phong-mesh", "Ghế văn phòng lưng mesh thoáng khí", 
                    new BigDecimal("2800000"), new BigDecimal("2500000"), "GVP-004", 35, "Mesh Chair", "Lưới mesh", "Đen", null, true);
                createProduct(cat2, "Ghế văn phòng có tay vịn", "ghe-van-phong-co-tay-vin", "Ghế văn phòng có tay vịn điều chỉnh", 
                    new BigDecimal("2200000"), null, "GVP-005", 30, "Comfort Plus", "Vải", "Xám", null, false);
                createProduct(cat2, "Ghế văn phòng cao cấp", "ghe-van-phong-cao-cap", "Ghế văn phòng cao cấp với nhiều tính năng", 
                    new BigDecimal("5500000"), new BigDecimal("4800000"), "GVP-006", 12, "Luxury Chair", "Da thật", "Nâu", null, true);
            }
            
            if (cat3 != null) {
                // Tủ hồ sơ 3-5
                createProduct(cat3, "Tủ hồ sơ 6 ngăn", "tu-ho-so-6-ngan", "Tủ hồ sơ 6 ngăn kéo lớn", 
                    new BigDecimal("4800000"), new BigDecimal("4200000"), "THS-003", 18, "Large Cabinet", "Thép", "Xám", "90x40x200 cm", true);
                createProduct(cat3, "Tủ hồ sơ di động", "tu-ho-so-di-dong", "Tủ hồ sơ có bánh xe di động", 
                    new BigDecimal("3200000"), null, "THS-004", 22, "Mobile Cabinet", "Thép", "Trắng", "60x40x120 cm", false);
                createProduct(cat3, "Tủ hồ sơ chống cháy", "tu-ho-so-chong-chay", "Tủ hồ sơ chống cháy an toàn", 
                    new BigDecimal("6500000"), new BigDecimal("5800000"), "THS-005", 8, "Fire Safe", "Thép chống cháy", "Xám", "90x40x180 cm", true);
            }
            
            if (cat4 != null) {
                // Kệ sách 3-5
                createProduct(cat4, "Kệ sách 7 tầng", "ke-sach-7-tang", "Kệ sách 7 tầng lớn", 
                    new BigDecimal("3200000"), new BigDecimal("2800000"), "KS-003", 15, "Tall Shelf", "MDF", "Trắng", "80x30x210 cm", true);
                createProduct(cat4, "Kệ sách góc", "ke-sach-goc", "Kệ sách góc tiết kiệm không gian", 
                    new BigDecimal("1800000"), null, "KS-004", 25, "Corner Shelf", "Gỗ", "Nâu", "60x60x180 cm", false);
                createProduct(cat4, "Kệ sách kính", "ke-sach-kinh", "Kệ sách kính hiện đại", 
                    new BigDecimal("2800000"), new BigDecimal("2500000"), "KS-005", 20, "Glass Shelf", "Kính + Gỗ", "Trong suốt", "100x30x180 cm", true);
            }
            
            System.out.println("✓ Đã tạo " + productRepository.count() + " sản phẩm test");
        }
    }
    
    private void createProduct(Category category, String name, String slug, String shortDesc,
                              BigDecimal price, BigDecimal salePrice, String sku, int stock,
                              String brand, String material, String color, String dimensions, boolean featured) {
        Product product = new Product();
        product.setName(name);
        product.setSlug(slug);
        product.setShortDescription(shortDesc);
        product.setDescription(shortDesc + ". Sản phẩm chất lượng cao, phù hợp cho văn phòng hiện đại.");
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
        productRepository.save(product);
    }
}

