package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = fileStorageService.storeFile(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("url", imageUrl);
        
        return ResponseEntity.ok(response);
    }
}