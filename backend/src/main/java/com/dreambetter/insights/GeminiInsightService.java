package com.dreambetter.insights;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Service
public class GeminiInsightService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final String fallbackModel;
    private final String baseUrl;

    public GeminiInsightService(
            RestClient restClient,
            ObjectMapper objectMapper,
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.model}") String model,
            @Value("${app.gemini.fallback-model}") String fallbackModel,
            @Value("${app.gemini.base-url}") String baseUrl) {
        this.restClient = restClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        this.fallbackModel = fallbackModel;
        this.baseUrl = baseUrl;
    }

    public JsonNode generate(InsightRequest request) {
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "Gemini is not configured on the server.");
        }
        String prompt = """
                You are a sleep wellness assistant, not a medical diagnostician.
                Analyze only the supplied data. Return valid JSON with exactly these
                fields: title, summary, evidence, recommendations, confidence,
                safetyMessage. evidence and recommendations must be arrays of strings.
                Do not diagnose conditions or infer sensitive facts.
                Sleep data:
                %s
                Lifestyle data:
                %s
                """.formatted(request.sleepData(), request.lifestyleData() == null ? "" : request.lifestyleData());
        Map<String, Object> payload = Map.of(
                "contents", new Object[] { Map.of(
                        "parts", new Object[] { Map.of("text", prompt) }
                ) },
                "generationConfig", Map.of("responseMimeType", "application/json", "temperature", 0.2)
        );

        try {
            JsonNode response;
            try {
                response = request(model, payload);
            } catch (RestClientResponseException exception) {
                if (exception.getStatusCode().value() != 429 && exception.getStatusCode().value() < 500) {
                    throw exception;
                }
                response = request(fallbackModel, payload);
            }
            String text = response.path("candidates").path(0).path("content").path("parts")
                    .path(0).path("text").asText("");
            if (text.isBlank()) {
                throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                        "Gemini returned no insight content.");
            }
            return objectMapper.readTree(text);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "Gemini insight generation failed.", exception);
        }
    }

    private JsonNode request(String modelName, Map<String, Object> payload) {
        return restClient.post()
                .uri(baseUrl + "/v1beta/models/" + modelName + ":generateContent?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(JsonNode.class);
    }
}
