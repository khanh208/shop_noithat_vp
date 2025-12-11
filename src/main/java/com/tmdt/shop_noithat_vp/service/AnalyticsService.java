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
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
        
        List<Order> orders = orderRepository.findDeliveredOrdersBetween(startOfMonth, endOfMonth);
        return orders.stream()
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
        return productRepository.findByStockQuantityLessThanEqualAndIsDeletedFalse(10).size();
    }
    
    // ========== DOANH THU THEO THỜI GIAN ==========
    
    public Map<String, Object> getRevenueByTime(LocalDateTime startDate, LocalDateTime endDate, String groupBy) {
        // Xử lý null date
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();

        List<Order> orders = orderRepository.findDeliveredOrdersBetween(start, end);
        
        Map<String, BigDecimal> revenueMap = new TreeMap<>();
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
            case "day": return dateTime.toLocalDate().toString();
            case "week": 
                int week = dateTime.get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());
                return dateTime.getYear() + "-W" + week;
            case "month": return dateTime.getYear() + "-" + String.format("%02d", dateTime.getMonthValue());
            case "year": return String.valueOf(dateTime.getYear());
            default: return dateTime.toLocalDate().toString();
        }
    }
    
    // ========== TOP SẢN PHẨM BÁN CHẠY ==========
    
    public List<Map<String, Object>> getTopSellingProducts(int limit, LocalDateTime startDate, LocalDateTime endDate) {
        // Xử lý null date
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();

        List<Object[]> results = orderRepository.findTopSellingProducts(start, end, PageRequest.of(0, limit));
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (Object[] row : results) {
            Product product = (Product) row[0];
            Long quantitySold = (Long) row[1];
            BigDecimal revenue = (BigDecimal) row[2];
            
            Map<String, Object> map = new HashMap<>();
            map.put("productId", product.getId());
            map.put("productName", product.getName());
            map.put("quantitySold", quantitySold);
            map.put("revenue", revenue);
            map.put("price", product.getSalePrice() != null ? product.getSalePrice() : product.getPrice());
            response.add(map);
        }
        return response;
    }
    
    // ========== THỐNG KÊ TRẠNG THÁI ==========
    
    public long getOrderCountByStatus(OrderStatus status) {
        return orderRepository.countByOrderStatusAndIsDeletedFalse(status);
    }
    
    // ========== DOANH THU THEO DANH MỤC ==========
    
    public List<Map<String, Object>> getRevenueByCategory(LocalDateTime startDate, LocalDateTime endDate) {
        // Xử lý null date
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();

        List<Object[]> results = orderRepository.findRevenueByCategory(start, end);
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (Object[] row : results) {
            Category category = (Category) row[0];
            BigDecimal revenue = (BigDecimal) row[1];
            Long quantity = (Long) row[2];
            
            Map<String, Object> map = new HashMap<>();
            map.put("categoryId", category.getId());
            map.put("categoryName", category.getName());
            map.put("revenue", revenue);
            map.put("productsSold", quantity);
            response.add(map);
        }
        return response;
    }
    
    // ========== TOP KHÁCH HÀNG ==========
    
    public List<Map<String, Object>> getTopCustomers(int limit) {
        List<Order> orders = orderRepository.findByOrderStatusAndIsDeletedFalse(OrderStatus.DELIVERED, org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        Map<User, BigDecimal> customerSpendingMap = new HashMap<>();
        Map<User, Long> customerOrderCountMap = new HashMap<>();
        
        for (Order order : orders) {
            User user = order.getUser();
            customerSpendingMap.merge(user, order.getTotalAmount(), BigDecimal::add);
            customerOrderCountMap.merge(user, 1L, Long::sum);
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
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime end = endDate != null ? endDate : LocalDateTime.now();

        List<Order> allOrders = orderRepository.findByCreatedAtBetweenAndIsDeletedFalse(start, end);
        long total = allOrders.size();
        long completed = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED).count();
        long cancelled = allOrders.stream().filter(o -> o.getOrderStatus() == OrderStatus.CANCELLED).count();
        
        Map<String, Object> res = new HashMap<>();
        res.put("totalOrders", total);
        res.put("completedOrders", completed);
        res.put("cancelledOrders", cancelled);
        res.put("conversionRate", total > 0 ? Math.round(completed * 100.0 / total * 100.0) / 100.0 : 0);
        res.put("cancellationRate", total > 0 ? Math.round(cancelled * 100.0 / total * 100.0) / 100.0 : 0);
        return res;
    }
    
    // ========== SẢN PHẨM TỒN KHO THẤP ==========

    public List<Map<String, Object>> getLowStockProducts() {
        return productRepository.findByStockQuantityLessThanEqualAndIsDeletedFalse(10).stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("productId", p.getId());
            m.put("productName", p.getName());
            m.put("sku", p.getSku());
            m.put("stockQuantity", p.getStockQuantity());
            m.put("minStockLevel", p.getMinStockLevel());
            m.put("category", p.getCategory().getName());
            return m;
        }).collect(Collectors.toList());
    }
    
    // ========== EXPORT REPORT (EXCEL) ==========
    
    public byte[] exportReport(String reportType, LocalDateTime startDate, LocalDateTime endDate) {
        try (Workbook workbook = new XSSFWorkbook(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet(reportType);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);

            int rowIdx = 0;
            switch (reportType.toLowerCase()) {
                case "revenue":
                    rowIdx = generateRevenueReport(sheet, headerStyle, currencyStyle, startDate, endDate);
                    break;
                case "products":
                    rowIdx = generateProductReport(sheet, headerStyle, currencyStyle, startDate, endDate);
                    break;
                default:
                    Row row = sheet.createRow(0);
                    row.createCell(0).setCellValue("Report type not supported");
            }
            
            for (int i = 0; i < 5; i++) sheet.autoSizeColumn(i);
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Excel Error: " + e.getMessage());
        }
    }

    private int generateRevenueReport(Sheet sheet, CellStyle headerStyle, CellStyle currencyStyle, LocalDateTime start, LocalDateTime end) {
        createHeader(sheet, headerStyle, 0, "Thời gian", "Doanh thu (VNĐ)");
        Map<String, Object> data = getRevenueByTime(start, end, "day");
        List<String> labels = (List<String>) data.get("labels");
        List<BigDecimal> values = (List<BigDecimal>) data.get("data");
        
        int rowIdx = 1;
        for (int i = 0; i < labels.size(); i++) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(labels.get(i));
            Cell val = row.createCell(1);
            val.setCellValue(values.get(i).doubleValue());
            val.setCellStyle(currencyStyle);
        }
        return rowIdx;
    }

    private int generateProductReport(Sheet sheet, CellStyle headerStyle, CellStyle currencyStyle, LocalDateTime start, LocalDateTime end) {
        createHeader(sheet, headerStyle, 0, "Tên sản phẩm", "Số lượng bán (Đã giao)", "Doanh thu (VNĐ)");
        List<Map<String, Object>> products = getTopSellingProducts(1000, start, end);
        
        int rowIdx = 1;
        for (Map<String, Object> p : products) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue((String) p.get("productName"));
            row.createCell(1).setCellValue(Long.parseLong(p.get("quantitySold").toString()));
            Cell rev = row.createCell(2);
            rev.setCellValue(((BigDecimal) p.get("revenue")).doubleValue());
            rev.setCellStyle(currencyStyle);
        }
        return rowIdx;
    }

    private void createHeader(Sheet sheet, CellStyle style, int rowIdx, String... headers) {
        Row row = sheet.createRow(rowIdx);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }
    
    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
    
    private CellStyle createCurrencyStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        DataFormat format = wb.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        return style;
    }
}