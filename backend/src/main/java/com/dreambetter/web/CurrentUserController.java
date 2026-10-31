package com.dreambetter.web;

import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CurrentUserController {
    @GetMapping("/api/me")
    public Map<String, String> currentUser(Authentication authentication) {
        return Map.of("supabaseUserId", authentication.getName());
    }
}
