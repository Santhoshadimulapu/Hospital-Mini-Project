package com.hospital.service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class GptSymptomService {

    private static final Logger log = Logger.getLogger(GptSymptomService.class.getName());

    private static final String SYSTEM_PROMPT =
            "You are a safe medical triage assistant helping patients find the right doctor specialty.\n" +
            "Rules you MUST follow:\n" +
            "1. NEVER diagnose any disease. NEVER prescribe medications.\n" +
            "2. Always recommend the patient consult a qualified physician.\n" +
            "3. For any life-threatening symptom (chest pain, difficulty breathing, stroke, severe bleeding, unresponsiveness, seizure) set emergency=true.\n" +
            "4. Choose specializations ONLY from this fixed list: General Medicine, Cardiology, Neurology, Orthopedics, Dermatology, ENT, Pulmonology, Gastroenterology, Gynecology, Pediatrics, Psychiatry, Ophthalmology, Urology, Oncology, Endocrinology.\n" +
            "5. Respond ONLY with valid JSON — no markdown, no code fences, no explanation outside JSON.\n" +
            "6. Use this exact JSON structure:\n" +
            "{\n" +
            "  \"specializations\": [\"SpecA\", \"SpecB\"],\n" +
            "  \"emergency\": false,\n" +
            "  \"urgency\": \"LOW\",\n" +
            "  \"reasoning\": \"One to three sentences explaining why these specializations were chosen.\"\n" +
            "}\n" +
            "urgency must be one of: LOW, MEDIUM, HIGH.\n" +
            "Provide 1 to 3 specializations ordered by relevance.";

    @Value("${hf.api.key:}")
    private String apiKey;

    @Value("${hf.model:meta-llama/Llama-3.1-8B-Instruct}")
    private String model;

    @Value("${hf.timeout-seconds:15}")
    private int timeoutSeconds;

    @Value("${hf.api.url:https://router.huggingface.co/v1/chat/completions}")
    private String apiUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplateBuilder restTemplateBuilder;

    public GptSymptomService(ObjectMapper objectMapper, RestTemplateBuilder restTemplateBuilder) {
        this.objectMapper = objectMapper;
        this.restTemplateBuilder = restTemplateBuilder;
    }

    /**
     * Calls GPT to analyse symptoms and return a structured result.
     * Throws RuntimeException if the API key is missing or the call fails.
     */
    public GptAnalysisResult analyseSymptoms(String symptoms, String city) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Hugging Face API key is not configured. Please set hf.api.key in application.properties.");
        }

        try {
            RestTemplate restTemplate = restTemplateBuilder
                    .setConnectTimeout(Duration.ofSeconds(timeoutSeconds))
                    .setReadTimeout(Duration.ofSeconds(timeoutSeconds))
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            String userMessage = "Patient symptoms: " + sanitizeInput(symptoms)
                    + (city != null && !city.isBlank() ? "\nPreferred city: " + sanitizeInput(city) : "");

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("temperature", 0.2);
            requestBody.put("max_tokens", 300);

            ArrayNode messages = requestBody.putArray("messages");

            ObjectNode systemMsg = objectMapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", SYSTEM_PROMPT);
            messages.add(systemMsg);

            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", userMessage);
            messages.add(userMsg);

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

            String rawResponse = restTemplate.postForObject(apiUrl, entity, String.class);
            return parseGptResponse(rawResponse);

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.warning("Hugging Face API error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            throw new RuntimeException("AI service error: " + e.getStatusCode() + ". Check your Hugging Face API key and model access.");
        } catch (RestClientException e) {
            log.warning("GPT API call failed: " + e.getMessage());
            throw new RuntimeException("AI service is currently unavailable. Please try again later.");
        } catch (Exception e) {
            log.warning("Unexpected error during GPT call: " + e.getMessage());
            throw new RuntimeException("AI service encountered an error. Please try again later.");
        }
    }

    private GptAnalysisResult parseGptResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            JsonNode result = objectMapper.readTree(content);
            List<String> specializations = objectMapper.convertValue(
                    result.path("specializations"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));

            boolean emergency = result.path("emergency").asBoolean(false);
            String urgency = result.path("urgency").asText("LOW");
            String reasoning = result.path("reasoning").asText("");

            if (specializations == null || specializations.isEmpty()) {
                specializations = Collections.singletonList("General Medicine");
            }

            return new GptAnalysisResult(specializations, emergency, urgency, reasoning);
        } catch (Exception e) {
            log.warning("Failed to parse GPT JSON response: " + e.getMessage());
            throw new RuntimeException("AI service returned an unexpected response. Please try again.");
        }
    }

    /**
     * Basic sanitization to prevent prompt injection attempts from user input.
     * Strips content that could embed instructions into the prompt.
     */
    private String sanitizeInput(String input) {
        if (input == null) return "";
        return input
                .replace("\n", " ")
                .replace("\r", " ")
                .replaceAll("(?i)(ignore (previous|all|prior) instructions|act as|you are now|pretend|system:)", "[removed]")
                .trim();
    }

    public static class GptAnalysisResult {
        private final List<String> specializations;
        private final boolean emergency;
        private final String urgency;
        private final String reasoning;

        public GptAnalysisResult(List<String> specializations, boolean emergency, String urgency, String reasoning) {
            this.specializations = Collections.unmodifiableList(specializations);
            this.emergency = emergency;
            this.urgency = urgency;
            this.reasoning = reasoning;
        }

        public List<String> getSpecializations() { return specializations; }
        public boolean isEmergency() { return emergency; }
        public String getUrgency() { return urgency; }
        public String getReasoning() { return reasoning; }
    }
}