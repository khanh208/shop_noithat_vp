package com.tmdt.shop_noithat_vp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateProductRequest {
    @NotBlank(message = "Tên sản phẩm là bắt buộc")
    private String name;
    
    @NotBlank(message = "SKU là bắt buộc")
    private String sku;
    
    @NotNull(message = "Danh mục là bắt buộc")
    private Long categoryId;
    
    @NotNull(message = "Giá là bắt buộc")
    @Positive(message = "Giá phải lớn hơn 0")
    private BigDecimal price;
    
    private BigDecimal salePrice;
    
    private String description;
    
    private String shortDescription;
    
    @NotNull(message = "Số lượng tồn kho là bắt buộc")
    @Positive(message = "Số lượng phải lớn hơn 0")
    private Integer stockQuantity;
    
    private String brand;
    
    private String material;
    
    private String color;
    
    private String dimensions;
    
    private Boolean isFeatured = false;
    
    private Boolean isActive = true;
}




