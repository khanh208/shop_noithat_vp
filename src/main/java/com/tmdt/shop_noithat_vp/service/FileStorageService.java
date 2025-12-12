package com.tmdt.shop_noithat_vp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}") // Đã cấu hình trong application.properties
    private String uploadDir;

    public String storeFile(MultipartFile file) {
        try {
            // Tạo tên file duy nhất để tránh trùng lặp
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            
            // Đường dẫn lưu file: uploads/images/banners/
            Path uploadPath = Paths.get(uploadDir + "/images/banners");
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Lưu file
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Trả về đường dẫn tương đối để lưu vào DB (VD: /uploads/images/banners/abc.jpg)
            return "/uploads/images/banners/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Error: " + e.getMessage());
        }
    }
}