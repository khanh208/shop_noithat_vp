package com.tmdt.shop_noithat_vp.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull
    private Long productId;
    
    @NotNull
    private Long orderId;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
    private String comment;
    private String reviewImages;
}