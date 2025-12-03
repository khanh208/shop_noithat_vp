package com.tmdt.shop_noithat_vp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "addresses")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Address extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;
    
    @Column(nullable = false)
    private String province;
    
    @Column(nullable = false)
    private String district;
    
    @Column(nullable = false)
    private String ward;
    
    @Column(nullable = false)
    private String detail;
    
    @Column(name = "is_default")
    private Boolean isDefault = false;
    
    @Column(name = "address_type")
    private String addressType; // home, office, other
}




