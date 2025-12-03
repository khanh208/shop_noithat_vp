package com.tmdt.shop_noithat_vp.repository;

import com.tmdt.shop_noithat_vp.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserIdAndIsDeletedFalse(Long userId);
    Optional<Address> findByUserIdAndIsDefaultTrueAndIsDeletedFalse(Long userId);
}




