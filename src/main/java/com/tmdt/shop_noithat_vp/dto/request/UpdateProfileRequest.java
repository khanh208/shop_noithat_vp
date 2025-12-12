// File: src/main/java/com/tmdt/shop_noithat_vp/dto/request/UpdateProfileRequest.java
// (Tạo file mới)

package com.tmdt.shop_noithat_vp.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phoneNumber;
    private String address;
    private String avatarUrl;
}