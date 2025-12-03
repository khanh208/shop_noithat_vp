package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.Category;
import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.model.OrderItem;
import com.tmdt.shop_noithat_vp.model.Product;
import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import com.tmdt.shop_noithat_vp.model.enums.Role;
import com.tmdt.shop_noithat_vp.repository.CategoryRepository;
import com.tmdt.shop_noithat_vp.repository.OrderRepository;
import com.tmdt.shop_noithat_vp.repository.ProductRepository;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    // ========== TỔNG QUAN ==========
    
    public BigDecimal getTotalRevenue() {
        return orderRepository.sumTotalAmountByOrderStatusAndIsDeletedFalse(OrderStatus.DELIVERED)
                .orElse(BigDecimal.ZERO);
    }
    
    public BigDecimal getMonthlyRevenue() {
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = YearMonth.now().atEndOfMonth().atTime(23, 59, 59);
        
        List<Order> orders = orderRepository.findByCreatedAtBetweenAndIsDeletedFalse(startOfMonth, endOfMonth);
        return orders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public long getTotalOrders() {
        return orderRepository.countByIsDeletedFalse();
    }
    
    public long getMonthlyOrders() {
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = YearMonth.now().atEndOfMonth().atTime(23, 59, 59);
        
        return orderRepository.findByCreatedAtBetweenAndIsDeletedFalse(startOfMonth, endOfMonth).size();
    }
    
    public long getTotalCustomers() {
        return userRepository.count();
    }
    
    public long getNewCustomersThisMonth() {
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        
        return userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt().isAfter(startOfMonth))
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .count();
    }
    
    public long getTotalProducts() {
        return productRepository.countByIsDeletedFalse();
    }
    
    public long getLowStockProductsCount() {
        // Giả sử mức tồn kho thấp là 10
        return productRepository.findByStockQuantityLessThanEqualAndIsDeletedFalse(10).size();
    }
    
    // ========== DOANH THU THEO THỜI GIAN ==========
    
    public Map<String, Object> getRevenueByTime(LocalDateTime startDate, LocalDateTime endDate, String groupBy) {
        List<Order> orders = orderRepository.findByCreatedAtBetweenAndIsDeletedFalse(startDate, endDate)
                .stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());
        
        Map<String, BigDecimal> revenueMap = new TreeMap<>(); // TreeMap để sắp xếp theo key (thời gian)
        
        for (Order order : orders) {
            String key = formatDateByGroupBy(order.getCreatedAt(), groupBy);
            revenueMap.merge(key, order.getTotalAmount(), BigDecimal::add);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("labels", new ArrayList<>(revenueMap.keySet()));
        result.put("data", new ArrayList<>(revenueMap.values()));
        result.put("groupBy", groupBy);
        
        return result;
    }
    
    private String formatDateByGroupBy(LocalDateTime dateTime, String groupBy) {
        if (groupBy == null) return dateTime.toLocalDate().toString();
        
        switch (groupBy.toLowerCase()) {
            case "day":
                return dateTime.toLocalDate().toString();
            case "week":
                int weekOfYear = dateTime.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());
                return dateTime.getYear() + "-W" + weekOfYear;
            case "month":
                return dateTime.getYear() + "-" + String.format("%02d", dateTime.getMonthValue());
            case "year":
                return String.valueOf(dateTime.getYear());
            default:
                return dateTime.toLocalDate().toString();
        }
    }
    
    // ========== TOP SẢN PHẨM BÁN CHẠY ==========
    
    public List<Map<String, Object>> getTopSellingProducts(int limit, LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders;
        
        if (startDate != null && endDate != null) {
            orders = orderRepository.findByCreatedAtBetweenAndIsDeletedFalse(startDate, endDate);
        } else {
            orders = orderRepository.findByIsDeletedFalse(org.springframework.data.domain.Pageable.unpaged()).getContent();
        }
        
        Map<Product, Integer> productSalesMap = new HashMap<>();
        Map<Product, BigDecimal> productRevenueMap = new HashMap<>();
        
        for (Order order : orders) {
            if (order.getOrderStatus() == OrderStatus.DELIVERED) {
                for (OrderItem item : order.getOrderItems()) {
                    Product product = item.getProduct();
                    productSalesMap.merge(product, item.getQuantity(), Integer::sum);
                    productRevenueMap.merge(product, item.getTotalPrice(), BigDecimal::add);
                }
            }
        }
        
        return productSalesMap.entrySet().stream()
                .sorted(Map.Entry.<Product, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    Product product = entry.getKey();
                    map.put("productId", product.getId());
                    map.put("productName", product.getName());
                    map.put("quantitySold", entry.getValue());
                    map.put("revenue", productRevenueMap.get(product));
                    map.put("price", product.getSalePrice() != null ? product.getSalePrice() : product.getPrice());
                    return map;
                })
                .collect(Collectors.toList());
    }
    
    // ========== THỐNG KÊ ĐƠN HÀNG THEO TRẠNG THÁI ==========
    
    public long getOrderCountByStatus(OrderStatus status) {
        return orderRepository.countByOrderStatusAndIsDeletedFalse(status);
    }
    
    // ========== DOANH THU THEO DANH MỤC ==========
    
    public List<Map<String, Object>> getRevenueByCategory(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders;
        
        if (startDate != null && endDate != null) {
            orders = orderRepository.findByCreatedAtBetweenAndIsDeletedFalse(startDate, endDate);
        } else {
            orders = orderRepository.findByIsDeletedFalse(org.springframework.data.domain.Pageable.unpaged()).getContent();
        }
        
        Map<Category, BigDecimal> categoryRevenueMap = new HashMap<>();
        Map<Category, Integer> categoryCountMap = new HashMap<>();
        
        for (Order order : orders) {
            if (order.getOrderStatus() == OrderStatus.DELIVERED) {
                for (OrderItem item : order.getOrderItems()) {
                    Category category = item.getProduct().getCategory();
                    if (category != null) {
                        categoryRevenueMap.merge(category, item.getTotalPrice(), BigDecimal::add);
                        categoryCountMap.merge(category, item.getQuantity(), Integer::sum);
                    }
                }
            }
        }
        
        return categoryRevenueMap.entrySet().stream()
                .sorted(Map.Entry.<Category, BigDecimal>comparingByValue().reversed())
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    Category category = entry.getKey();
                    map.put("categoryId", category.getId());
                    map.put("categoryName", category.getName());
                    map.put("revenue", entry.getValue());
                    map.put("productsSold", categoryCountMap.get(category));
                    return map;
                })
                .collect(Collectors.toList());
    }
    
    // ========== TOP KHÁCH HÀNG ==========
    
    public List<Map<String, Object>> getTopCustomers(int limit) {
        List<Order> orders = orderRepository.findByIsDeletedFalse(org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        Map<User, BigDecimal> customerSpendingMap = new HashMap<>();
        Map<User, Long> customerOrderCountMap = new HashMap<>();
        
        for (Order order : orders) {
            if (order.getOrderStatus() == OrderStatus.DELIVERED) {
                User user = order.getUser();
                customerSpendingMap.merge(user, order.getTotalAmount(), BigDecimal::add);
                customerOrderCountMap.merge(user, 1L, Long::sum);
            }
        }
        
        return customerSpendingMap.entrySet().stream()
                .sorted(Map.Entry.<User, BigDecimal>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    User user = entry.getKey();
                    map.put("userId", user.getId());
                    map.put("username", user.getUsername());
                    map.put("fullName", user.getFullName());
                    map.put("email", user.getEmail());
                    map.put("totalSpent", entry.getValue());
                    map.put("orderCount", customerOrderCountMap.get(user));
                    return map;
                })
                .collect(Collectors.toList());
    }
    
    // ========== TỶ LỆ CHUYỂN ĐỔI ==========
    
    public Map<String, Object> getConversionRate(LocalDateTime startDate, LocalDateTime endDate) {
        // Tổng số đơn hàng được tạo
        List<Order> allOrders = orderRepository.findByCreatedAtBetweenAndIsDeletedFalse(startDate, endDate);
        long totalOrders = allOrders.size();
        
        // Đơn hàng thành công
        long completedOrders = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED)
                .count();
        
        // Đơn hàng bị hủy
        long cancelledOrders = allOrders.stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.CANCELLED)
                .count();
        
        // Tính tỷ lệ
        double conversionRate = totalOrders > 0 ? (completedOrders * 100.0 / totalOrders) : 0;
        double cancellationRate = totalOrders > 0 ? (cancelledOrders * 100.0 / totalOrders) : 0;
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalOrders", totalOrders);
        result.put("completedOrders", completedOrders);
        result.put("cancelledOrders", cancelledOrders);
        result.put("conversionRate", Math.round(conversionRate * 100.0) / 100.0);
        result.put("cancellationRate", Math.round(cancellationRate * 100.0) / 100.0);
        
        return result;
    }
    
    // ========== SẢN PHẨM TỒN KHO THẤP ==========
    
    public List<Map<String, Object>> getLowStockProducts() {
        List<Product> products = productRepository.findByStockQuantityLessThanEqualAndIsDeletedFalse(10);
        
        return products.stream()
                .map(product -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("productId", product.getId());
                    map.put("productName", product.getName());
                    map.put("sku", product.getSku());
                    map.put("stockQuantity", product.getStockQuantity());
                    map.put("minStockLevel", product.getMinStockLevel());
                    map.put("category", product.getCategory().getName());
                    return map;
                })
                .collect(Collectors.toList());
    }
    
    // ========== EXPORT REPORT ==========
    
    public byte[] exportReport(String reportType, LocalDateTime startDate, LocalDateTime endDate) {
        // Đây là placeholder - trong thực tế bạn sẽ dùng Apache POI để tạo Excel
        // Ví dụ đơn giản trả về CSV
        String csvData = generateCSVReport(reportType, startDate, endDate);
        return csvData.getBytes();
    }
    
    @SuppressWarnings("unchecked")
    private String generateCSVReport(String reportType, LocalDateTime startDate, LocalDateTime endDate) {
        StringBuilder csv = new StringBuilder();
        
        switch (reportType.toLowerCase()) {
            case "revenue":
                csv.append("Date,Revenue\n");
                Map<String, Object> revenueData = getRevenueByTime(startDate, endDate, "day");
                List<String> labels = (List<String>) revenueData.get("labels");
                List<BigDecimal> data = (List<BigDecimal>) revenueData.get("data");
                for (int i = 0; i < labels.size(); i++) {
                    csv.append(labels.get(i)).append(",").append(data.get(i)).append("\n");
                }
                break;
                
            case "products":
                csv.append("Product Name,Quantity Sold,Revenue\n");
                List<Map<String, Object>> products = getTopSellingProducts(100, startDate, endDate);
                for (Map<String, Object> product : products) {
                    csv.append(product.get("productName")).append(",")
                       .append(product.get("quantitySold")).append(",")
                       .append(product.get("revenue")).append("\n");
                }
                break;
                
            default:
                csv.append("Report not available\n");
        }
        
        return csv.toString();
    }
}