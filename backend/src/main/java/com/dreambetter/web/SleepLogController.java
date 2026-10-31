package com.dreambetter.web;

import com.dreambetter.sleep.SleepLogService;
import com.dreambetter.sleep.SleepLogRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/sleep-logs")
public class SleepLogController {
    private final SleepLogService service;

    public SleepLogController(SleepLogService service) {
        this.service = service;
    }

    @PostMapping
    public Map<String, Object> create(@Valid @RequestBody SleepLogRequest request,
                                      Authentication authentication) {
        return service.save(userId(authentication), request);
    }

    @GetMapping
    public List<Map<String, Object>> list(Authentication authentication) {
        return service.list(userId(authentication));
    }

    @GetMapping("/summary")
    public Map<String, Object> summary(Authentication authentication) {
        return service.summary(userId(authentication));
    }

    @PatchMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id,
                                      @Valid @RequestBody SleepLogRequest request,
                                      Authentication authentication) {
        return service.update(userId(authentication), id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id, Authentication authentication) {
        service.delete(userId(authentication), id);
    }

    private String userId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED,
                    "Please sign in before saving sleep data.");
        }
        return authentication.getName();
    }
}
