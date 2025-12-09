package com.tmdt.shop_noithat_vp.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // Import quan trọng
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString; // Import quan trọng

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem extends BaseEntity {
    
    // === THÊM CÁC ANNOTATION NÀY ===
    @JsonIgnore // Ngắt vòng lặp JSON: Order -> OrderItem -> Order...
    @ToString.Exclude // Ngắt vòng lặp Lombok toString
    @EqualsAndHashCode.Exclude // Ngắt vòng lặp Lombok hashCode
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    // === THÊM CÁC ANNOTATION NÀY ===
    // Product không cần JsonIgnore (để Frontend hiển thị thông tin sp), 
    // nhưng cần Exclude của Lombok để tránh lỗi Lazy Loading khi log
    @ToString.Exclude 
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal totalPrice;
    
    @Column(name = "product_name")
    private String productName; // Lưu tên sản phẩm tại thời điểm đặt hàng
}