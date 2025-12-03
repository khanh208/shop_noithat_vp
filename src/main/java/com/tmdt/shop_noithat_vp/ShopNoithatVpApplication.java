package com.tmdt.shop_noithat_vp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.tmdt.shop_noithat_vp")
@EnableJpaRepositories(basePackages = "com.tmdt.shop_noithat_vp.repository")
public class ShopNoithatVpApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShopNoithatVpApplication.class, args);
	}

}
