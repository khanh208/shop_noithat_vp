package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.dto.request.CreateProductRequest;
import com.tmdt.shop_noithat_vp.dto.request.UpdateProductRequest;
import com.tmdt.shop_noithat_vp.model.Category;
import com.tmdt.shop_noithat_vp.model.Product;
import com.tmdt.shop_noithat_vp.repository.CategoryRepository;
import com.tmdt.shop_noithat_vp.repository.ProductRepository;
import com.tmdt.shop_noithat_vp.repository.ProductSpecification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findByIsActiveTrueAndIsDeletedFalse(pageable);
    }
    
    public Page<Product> getAllProductsForAdmin(Pageable pageable) {
        return productRepository.findByIsDeletedFalse(pageable);
    }
    
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndIsActiveTrueAndIsDeletedFalse(categoryId, pageable);
    }
    
    public Page<Product> getFeaturedProducts(Pageable pageable) {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrueAndIsDeletedFalse(pageable);
    }
    
    public Page<Product> getBestSellingProducts(Pageable pageable) {
        return productRepository.findBestSellingProducts(pageable);
    }
    
    public Page<Product> getDiscountedProducts(Pageable pageable) {
        return productRepository.findDiscountedProducts(pageable);
    }
    
    // === HÀM NÀY SẼ HẾT LỖI SAU KHI SỬA REPOSITORY ===
    public Page<Product> searchProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, 
                                   String brand, String keyword, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.filterProducts(categoryId, minPrice, maxPrice, brand, keyword);
        // Gọi hàm findAll(Specification, Pageable) của JpaSpecificationExecutor
        return productRepository.findAll(spec, pageable);
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id)
                .filter(p -> !p.getIsDeleted() && p.getIsActive());
    }
    
    public Optional<Product> getProductBySlug(String slug) {
        return productRepository.findBySlug(slug)
                .filter(p -> !p.getIsDeleted() && p.getIsActive());
    }
    
    public void incrementViewCount(Long productId) {
        productRepository.findById(productId).ifPresent(product -> {
            product.setViewCount(product.getViewCount() + 1);
            productRepository.save(product);
        });
    }
    
    public long countAllProducts() {
        return productRepository.countByIsDeletedFalse();
    }
    
    public Optional<Product> getProductByIdForAdmin(Long id) {
        return productRepository.findById(id)
                .filter(p -> !p.getIsDeleted());
    }
    
    @Transactional
    public Product createProduct(CreateProductRequest request) {
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new RuntimeException("SKU đã tồn tại: " + request.getSku());
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        
        Product product = new Product();
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setSlug(generateSlug(request.getName()));
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setSalePrice(request.getSalePrice());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setStockQuantity(request.getStockQuantity());
        product.setBrand(request.getBrand());
        product.setMaterial(request.getMaterial());
        product.setColor(request.getColor());
        product.setDimensions(request.getDimensions());
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        product.setViewCount(0L);
        product.setSoldCount(0L);
        
        return productRepository.save(product);
    }
    
    @Transactional
    public Product updateProduct(Long productId, UpdateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        
        product.setName(request.getName());
        product.setSlug(generateSlug(request.getName()));
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setSalePrice(request.getSalePrice());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setStockQuantity(request.getStockQuantity());
        product.setBrand(request.getBrand());
        product.setMaterial(request.getMaterial());
        product.setColor(request.getColor());
        product.setDimensions(request.getDimensions());
        
        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        
        return productRepository.save(product);
    }
    
    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        product.setIsDeleted(true);
        productRepository.save(product);
    }
    
    private String generateSlug(String name) {
        String slug = name.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
        
        String baseSlug = slug;
        int counter = 1;
        while (productRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        
        return slug;
    }
}