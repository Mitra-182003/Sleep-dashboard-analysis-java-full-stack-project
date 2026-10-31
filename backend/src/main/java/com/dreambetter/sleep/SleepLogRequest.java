package com.dreambetter.sleep;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SleepLogRequest(
        @NotBlank String sleepDate,
        @NotBlank String bedtime,
        @NotBlank String wakeTime,
        @Min(1) @Max(10) Integer quality,
        @Size(max = 80) String mood,
        @Size(max = 2000) String notes) {
}
