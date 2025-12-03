package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.dto.request.ForgotPasswordRequest;
import com.tmdt.shop_noithat_vp.dto.request.LoginRequest;
import com.tmdt.shop_noithat_vp.dto.request.RegisterRequest;
import com.tmdt.shop_noithat_vp.dto.request.ResetPasswordRequest;
import com.tmdt.shop_noithat_vp.dto.response.AuthResponse;
import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.model.enums.Role;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import com.tmdt.shop_noithat_vp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder; // Giữ lại import này
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Authentication Service - Manual implementation without Spring Security dependencies
 * Handles registration, login, password reset manually
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;
    
    // Đã được inject và sẽ dùng BCryptPasswordEncoder được khai báo trong SecurityConfig
    @Autowired
    private PasswordEncoder passwordEncoder; 

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Validate password strength
        if (request.getPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // FIX: Hash password sử dụng PasswordEncoder (BCrypt)
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.CUSTOMER);
        user.setIsActive(true);
        user.setIsEmailVerified(false);
        user.setVerificationToken(UUID.randomUUID().toString());

        // Save user
        user = userRepository.save(user);

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationToken());
        } catch (Exception e) {
            // FIX: Giữ lại System.err.println() theo code gốc, nhưng nên chuyển sang Logger
            System.err.println("Failed to send verification email: " + e.getMessage()); 
        }

        // Generate JWT token manually
        String token = jwtUtil.generateTokenFromUsername(user.getUsername(), user.getRole().name());

        return new AuthResponse(token, "Bearer", user.getId(), user.getUsername(),
                               user.getEmail(), user.getRole().name());
    }

    /**
     * Login user - Manual authentication without Spring Security
     */
    public AuthResponse login(LoginRequest request) {
        // Find user by username or email
        User user = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(),
                request.getUsernameOrEmail()
        ).orElseThrow(() -> new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng"));

        // Check if account is active
        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }
        
        // FIX: Thêm kiểm tra xác thực email
        if (!user.getIsEmailVerified()) {
            throw new RuntimeException("Vui lòng xác thực email trước khi đăng nhập.");
        }

        // FIX: Verify password sử dụng PasswordEncoder (BCrypt)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        // Generate JWT token
        String token = jwtUtil.generateTokenFromUsername(user.getUsername(), user.getRole().name());

        return new AuthResponse(token, "Bearer", user.getId(), user.getUsername(),
                               user.getEmail(), user.getRole().name());
    }

    /**
     * Verify email with token
     */
    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Token xác thực không hợp lệ"));

        user.setIsEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    /**
     * Forgot password - Send reset password email
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));

        // Check if account is active
        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        userRepository.save(user);

        // Send reset password email
        try {
            emailService.sendResetPasswordEmail(user.getEmail(), resetToken);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email đặt lại mật khẩu: " + e.getMessage());
        }
    }

    /**
     * Reset password with token
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        // Validate password strength
        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
        }

        // Find user by reset token
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"));

        // Check if account is active
        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }

        // FIX: Hash new password sử dụng PasswordEncoder (BCrypt)
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Clear reset token
        user.setResetPasswordToken(null);

        // Save user
        userRepository.save(user);
    }
}