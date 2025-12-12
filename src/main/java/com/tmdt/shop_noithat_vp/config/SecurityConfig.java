package com.tmdt.shop_noithat_vp.config;

import com.tmdt.shop_noithat_vp.security.JwtAuthenticationFilter;
import com.tmdt.shop_noithat_vp.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus; 
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    public SecurityConfig(CustomUserDetailsService userDetailsService, 
                         JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    // 1. Các API xác thực và trang chủ
                    "/api/auth/**", "/auth/**", "/", "/home", 
                    
                    // 2. Các API dữ liệu công khai (Sản phẩm, Danh mục, Blog)
                    "/api/products/**", "/api/categories/**", "/api/blog/**",
                    
                    // 3. API Banner & Upload (QUAN TRỌNG: Cần thiết để hiển thị banner và upload ảnh)
                    "/api/banners/**", 
                    "/api/upload/**",
                    
                    // 4. Các trang view (nếu dùng Thymeleaf/MVC cũ)
                    "/product/**", "/categories/**", "/blog/**",
                    
                    // 5. Thanh toán & Webhook
                    "/payment/callback", "/api/payment/**",
                    
                    // 6. Tài nguyên tĩnh (CSS, JS, Ảnh) và thư mục Uploads
                    "/css/**", "/js/**", "/images/**", "/uploads/**", 
                    
                    // 7. Trang lỗi (để tránh lỗi 401 khi ảnh không tìm thấy)
                    "/error"
                ).permitAll()
                
                // Các quyền truy cập dành cho Admin và Nhân viên
                .requestMatchers("/admin/**", "/api/admin/**").hasAnyRole("ADMIN", "SALES", "WAREHOUSE", "MARKETING")
                .requestMatchers("/shipper/**").hasRole("SHIPPER")
                
                // Tất cả các request khác đều cần đăng nhập
                .anyRequest().authenticated()
            )
            .exceptionHandling(e -> e
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/home", true)
                .failureUrl("/login?error=true")
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép Frontend (localhost:3000) và chính Backend (localhost:8082) gọi API
        configuration.setAllowedOrigins(List.of("http://localhost:8082", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}