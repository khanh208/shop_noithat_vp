package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.dto.request.ForgotPasswordRequest;
import com.tmdt.shop_noithat_vp.dto.request.LoginRequest;
import com.tmdt.shop_noithat_vp.dto.request.RegisterRequest;
import com.tmdt.shop_noithat_vp.dto.request.ResetPasswordRequest;
import com.tmdt.shop_noithat_vp.dto.response.AuthResponse;
import com.tmdt.shop_noithat_vp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    /**
     * Đăng ký tài khoản mới
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Đăng nhập
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Xác thực email - Hỗ trợ cả query param từ URL
     */
    @GetMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam("code") String token) {
        authService.verifyEmail(token);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.");
        response.put("success", "true");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Gửi lại email xác thực
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestParam String email) {
        authService.resendVerificationEmail(email);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Quên mật khẩu - Gửi email đặt lại mật khẩu
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Đặt lại mật khẩu với token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.");
        response.put("success", "true");
        return ResponseEntity.ok(response);
    }
}