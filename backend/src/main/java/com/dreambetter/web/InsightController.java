package com.dreambetter.web;

import com.dreambetter.insights.GeminiInsightService;
import com.dreambetter.insights.InsightRequest;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
public class InsightController {
    private final GeminiInsightService geminiInsightService;

    public InsightController(GeminiInsightService geminiInsightService) {
        this.geminiInsightService = geminiInsightService;
    }

    @PostMapping
    public JsonNode generate(@Valid @RequestBody InsightRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("An authenticated user is required.");
        }
        return geminiInsightService.generate(request);
    }
}
