package com.dreambetter.insights;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InsightRequest(
        @NotBlank @Size(max = 12000) String sleepData,
        @Size(max = 6000) String lifestyleData) {
}
