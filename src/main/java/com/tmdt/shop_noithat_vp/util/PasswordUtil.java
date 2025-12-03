package com.tmdt.shop_noithat_vp.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class for password hashing and verification
 * Uses SHA-256 with salt for password hashing
 */
public class PasswordUtil {
    
    private static final String ALGORITHM = "SHA-256";
    private static final int SALT_LENGTH = 16;
    private static final String DELIMITER = ":";
    
    /**
     * Hash a password with a randomly generated salt
     * Format: salt:hashedPassword
     */
    public static String hashPassword(String password) {
        try {
            // Generate random salt
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[SALT_LENGTH];
            random.nextBytes(salt);
            
            // Hash password with salt
            String hashedPassword = hashWithSalt(password, salt);
            
            // Encode salt to base64 for storage
            String saltBase64 = Base64.getEncoder().encodeToString(salt);
            
            // Return salt:hashedPassword format
            return saltBase64 + DELIMITER + hashedPassword;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
    
    /**
     * Verify a password against a stored hash
     * @param password Plain text password
     * @param storedHash Stored hash in format salt:hashedPassword
     * @return true if password matches, false otherwise
     */
    public static boolean verifyPassword(String password, String storedHash) {
        try {
            if (storedHash == null || !storedHash.contains(DELIMITER)) {
                return false;
            }
            
            // Split salt and hash
            String[] parts = storedHash.split(DELIMITER, 2);
            if (parts.length != 2) {
                return false;
            }
            
            String saltBase64 = parts[0];
            String storedHashedPassword = parts[1];
            
            // Decode salt from base64
            byte[] salt = Base64.getDecoder().decode(saltBase64);
            
            // Hash the provided password with the stored salt
            String hashedPassword = hashWithSalt(password, salt);
            
            // Compare hashes
            return hashedPassword.equals(storedHashedPassword);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Hash password with salt using SHA-256
     */
    private static String hashWithSalt(String password, byte[] salt) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance(ALGORITHM);
        
        // Add salt to password
        digest.update(salt);
        
        // Hash the password
        byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
        
        // Convert to hex string
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        
        return hexString.toString();
    }
}




