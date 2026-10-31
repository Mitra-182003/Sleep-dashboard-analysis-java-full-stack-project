package com.dreambetter.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.dreambetter")
@EntityScan("com.dreambetter")
@EnableJpaRepositories("com.dreambetter")
public class DreamBetterApplication {
    public static void main(String[] args) {
        SpringApplication.run(DreamBetterApplication.class, args);
    }
}
