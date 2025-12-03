package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.enums.OrderStatus;
import com.tmdt.shop_noithat_vp.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminDashboardController {
    
    @Autowired
    private AnalyticsService analyticsService;
    
    /**
     * Dashboard overview - Tổng quan
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        Map<String, Object> overview = new HashMap<>();
        
        // Tổng doanh thu
        BigDecimal totalRevenue = analyticsService.getTotalRevenue();
        overview.put("totalRevenue", totalRevenue);
        
        // Doanh thu tháng này
        BigDecimal monthlyRevenue = analyticsService.getMonthlyRevenue();
        overview.put("monthlyRevenue", monthlyRevenue);
        
        // Tổng đơn hàng
        long totalOrders = analyticsService.getTotalOrders();
        overview.put("totalOrders", totalOrders);
        
        // Đơn hàng tháng này
        long monthlyOrders = analyticsService.getMonthlyOrders();
        overview.put("monthlyOrders", monthlyOrders);
        
        // Tổng khách hàng
        long totalCustomers = analyticsService.getTotalCustomers();
        overview.put("totalCustomers", totalCustomers);
        
        // Khách hàng mới tháng này
        long newCustomers = analyticsService.getNewCustomersThisMonth();
        overview.put("newCustomers", newCustomers);
        
        // Tổng sản phẩm
        long totalProducts = analyticsService.getTotalProducts();
        overview.put("totalProducts", totalProducts);
        
        // Sản phẩm sắp hết hàng
        long lowStockProducts = analyticsService.getLowStockProductsCount();
        overview.put("lowStockProducts", lowStockProducts);
        
        return ResponseEntity.ok(overview);
    }
    
    /**
     * Doanh thu theo thời gian
     */
    @GetMapping("/revenue-by-time")
    public ResponseEntity<Map<String, Object>> getRevenueByTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "day") String groupBy) {
        
        Map<String, Object> data = analyticsService.getRevenueByTime(startDate, endDate, groupBy);
        return ResponseEntity.ok(data);
    }
    
    /**
     * Top sản phẩm bán chạy
     */
    @GetMapping("/top-selling-products")
    public ResponseEntity<List<Map<String, Object>>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<Map<String, Object>> products = analyticsService.getTopSellingProducts(limit, startDate, endDate);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Thống kê đơn hàng theo trạng thái
     */
    @GetMapping("/orders-by-status")
    public ResponseEntity<Map<String, Long>> getOrdersByStatus() {
        Map<String, Long> statusCount = new HashMap<>();
        
        for (OrderStatus status : OrderStatus.values()) {
            long count = analyticsService.getOrderCountByStatus(status);
            statusCount.put(status.name(), count);
        }
        
        return ResponseEntity.ok(statusCount);
    }
    
    /**
     * Doanh thu theo danh mục sản phẩm
     */
    @GetMapping("/revenue-by-category")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByCategory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<Map<String, Object>> data = analyticsService.getRevenueByCategory(startDate, endDate);
        return ResponseEntity.ok(data);
    }
    
    /**
     * Khách hàng mua nhiều nhất
     */
    @GetMapping("/top-customers")
    public ResponseEntity<List<Map<String, Object>>> getTopCustomers(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Map<String, Object>> customers = analyticsService.getTopCustomers(limit);
        return ResponseEntity.ok(customers);
    }
    
    /**
     * Tỷ lệ chuyển đổi (Conversion rate)
     */
    @GetMapping("/conversion-rate")
    public ResponseEntity<Map<String, Object>> getConversionRate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Map<String, Object> conversionData = analyticsService.getConversionRate(startDate, endDate);
        return ResponseEntity.ok(conversionData);
    }
    
    /**
     * Sản phẩm tồn kho thấp
     */
    @GetMapping("/low-stock-products")
    public ResponseEntity<List<Map<String, Object>>> getLowStockProducts() {
        List<Map<String, Object>> products = analyticsService.getLowStockProducts();
        return ResponseEntity.ok(products);
    }
    
    /**
     * Export báo cáo Excel
     */
    @GetMapping("/export-report")
    public ResponseEntity<byte[]> exportReport(
            @RequestParam String reportType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        byte[] excelData = analyticsService.exportReport(reportType, startDate, endDate);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=report_" + reportType + ".xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(excelData);
    }
}