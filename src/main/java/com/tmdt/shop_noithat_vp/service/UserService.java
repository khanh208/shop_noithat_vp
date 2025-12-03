package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.User;
import com.tmdt.shop_noithat_vp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

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
}

