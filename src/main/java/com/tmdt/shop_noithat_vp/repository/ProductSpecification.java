package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Product;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String brand, String keyword) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Chỉ lấy sản phẩm đang hoạt động và chưa bị xóa
            predicates.add(criteriaBuilder.isTrue(root.get("isActive")));
            predicates.add(criteriaBuilder.isFalse(root.get("isDeleted")));

            // 2. Lọc theo danh mục
            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            // 3. Lọc theo thương hiệu
            if (brand != null && !brand.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("brand"), brand));
            }

            // 4. Tìm kiếm từ khóa (Tên hoặc Mô tả)
            if (keyword != null && !keyword.isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate descLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern);
                predicates.add(criteriaBuilder.or(nameLike, descLike));
            }

            // 5. Lọc theo khoảng giá
            // Ưu tiên giá Sale nếu có, nếu không thì lấy giá gốc
            // Quan trọng: Phải ép kiểu về BigDecimal
            Expression<BigDecimal> finalPrice = criteriaBuilder.coalesce(
                root.get("salePrice"), 
                root.get("price")
            ).as(BigDecimal.class); 

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(finalPrice, minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(finalPrice, maxPrice));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}