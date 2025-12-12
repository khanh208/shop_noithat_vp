package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.tmdt.shop_noithat_vp.dto.request.UpdateProfileRequest;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public Optional<User> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            return userRepository.findByUsername(username);
        }
        
        return Optional.empty();
    }
    
    public Long getCurrentUserId(Authentication authentication) {
        return getCurrentUser(authentication)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
    }
    
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findByIsDeletedFalse(pageable);
    }
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        return userRepository.save(user);
    }
}

