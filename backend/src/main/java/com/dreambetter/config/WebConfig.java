package com.dreambetter.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.Arrays;
import java.util.stream.Stream;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final String frontendUrl;

    public WebConfig(@Value("${app.frontend-url}") String frontendUrls) {
        this.frontendUrl = frontendUrls;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(Stream.concat(
                        Arrays.stream(frontendUrl.split(",")),
                        Stream.of("http://localhost:5500", "http://127.0.0.1:5500"))
                        .map(String::trim)
                        .filter(origin -> !origin.isEmpty())
                        .distinct()
                        .toArray(String[]::new))
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
